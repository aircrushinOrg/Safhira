import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

interface ProviderRow {
  provider_id: number;
  state_id: number;
  provider_name: string;
  provider_address: string;
  provider_phone_num: string | null;
  provider_email: string | null;
  provider_longitude: string | null;
  provider_latitude: string | null;
  provider_provide_prep: boolean;
  provider_provide_pep: boolean;
  provider_free_sti_screening: boolean;
}

const STATE_ALIASES: Record<string, string> = {
  penang: 'Pulau Pinang',
  pulaupinang: 'Pulau Pinang',
  kualalumpur: 'W.P. Kuala Lumpur',
  kualalumpurfederalterritory: 'W.P. Kuala Lumpur',
  wpkualalumpur: 'W.P. Kuala Lumpur',
  wilayahpersekutuankualalumpur: 'W.P. Kuala Lumpur',
  labuan: 'W.P. Labuan',
  labuanfederalterritory: 'W.P. Labuan',
  wplabuan: 'W.P. Labuan',
  wilayahpersekutuanlabuan: 'W.P. Labuan',
  putrajaya: 'W.P. Putrajaya',
  putrajayafederalterritory: 'W.P. Putrajaya',
  wpputrajaya: 'W.P. Putrajaya',
  wilayahpersekutuanputrajaya: 'W.P. Putrajaya',
};

function normalizeStateKey(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function canonicalStateName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  const key = normalizeStateKey(trimmed);
  return STATE_ALIASES[key] ?? trimmed;
}

function loadEnvUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = join(process.cwd(), '.env');
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^DATABASE_URL\s*=\s*(.*)\s*$/);
      if (match) {
        let value = match[1].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        return value;
      }
    }
  } catch (_) {
    // ignore missing .env files
  }
  throw new Error('DATABASE_URL environment variable is required');
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') {
        i++;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim().length));
}

function boolFromCsv(value: string | undefined): boolean {
  const normalized = (value || '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'y';
}

function numericFromCsv(value: string | undefined): string | null {
  const trimmed = (value || '').trim();
  if (!trimmed) return null;
  const num = Number(trimmed.replace(/\s+/g, ''));
  if (!Number.isFinite(num)) return null;
  return String(num);
}

function textOrNull(value: string | undefined): string | null {
  const trimmed = (value || '').trim();
  return trimmed ? trimmed : null;
}

function columnIndex(headers: string[], name: string): number {
  const idx = headers.findIndex((header) => header.trim().toLowerCase() === name.trim().toLowerCase());
  if (idx === -1) {
    throw new Error(`Column ${name} not found in CSV file`);
  }
  return idx;
}

async function ensureStateId(sql: ReturnType<typeof postgres>, cache: Map<string, number>, stateName: string): Promise<number> {
  const canonical = canonicalStateName(stateName);
  if (!canonical) {
    throw new Error('State name is required for provider rows');
  }
  const cacheKey = normalizeStateKey(canonical);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  const found = await sql`select state_id from state where lower(state_name) = lower(${canonical}) limit 1`;
  if (found.length) {
    const id = found[0].state_id as number;
    cache.set(cacheKey, id);
    return id;
  }
  const inserted = await sql`insert into state (state_name) values (${canonical}) returning state_id`;
  const id = inserted[0].state_id as number;
  cache.set(cacheKey, id);
  return id;
}

async function seedProviders() {
  const DATABASE_URL = loadEnvUrl();
  const sql = postgres(DATABASE_URL, { max: 1, ssl: 'require' });

  try {
    const csvPath = join(__dirname, 'data', 'mypreplocator_dedup.csv');
    const csvContent = readFileSync(csvPath, 'utf8');
    const rows = parseCsv(csvContent);
    if (!rows.length) {
      console.log('No rows found in mypreplocator_dedup.csv');
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const idx = {
      name: columnIndex(headers, 'name'),
      state: columnIndex(headers, 'state'),
      address: columnIndex(headers, 'Full Address'),
      lat: columnIndex(headers, 'lat'),
      lng: columnIndex(headers, 'lng'),
      phone: columnIndex(headers, 'phone'),
      email: columnIndex(headers, 'email'),
      providesPrep: columnIndex(headers, 'providesPrep'),
      providesPep: columnIndex(headers, 'providesPep'),
      freeScreening: columnIndex(headers, 'freeSTIscreening'),
    };

    const stateCache = new Map<string, number>();
    const providerRows: ProviderRow[] = [];
    const skipped: { index: number; reason: string }[] = [];

    await sql`begin`;
    try {
      await sql`delete from provider`;

      let nextProviderId = 1;
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const name = (row[idx.name] || '').trim();
        const stateRaw = (row[idx.state] || '').trim();
        const stateName = canonicalStateName(stateRaw);
        const address = (row[idx.address] || '').trim();
        if (!name || !stateName || !address) {
          skipped.push({ index: i + 2, reason: 'Missing required name/state/address' });
          continue;
        }

        let stateId: number;
        try {
          stateId = await ensureStateId(sql, stateCache, stateName);
        } catch (error) {
          skipped.push({ index: i + 2, reason: (error as Error).message });
          continue;
        }

        const providerRecord: ProviderRow = {
          provider_id: nextProviderId++,
          state_id: stateId,
          provider_name: name,
          provider_address: address,
          provider_phone_num: textOrNull(row[idx.phone]),
          provider_email: textOrNull(row[idx.email]),
          provider_longitude: numericFromCsv(row[idx.lng]),
          provider_latitude: numericFromCsv(row[idx.lat]),
          provider_provide_prep: boolFromCsv(row[idx.providesPrep]),
          provider_provide_pep: boolFromCsv(row[idx.providesPep]),
          provider_free_sti_screening: boolFromCsv(row[idx.freeScreening]),
        };

        providerRows.push(providerRecord);
      }

      const batchSize = 100;
      for (let i = 0; i < providerRows.length; i += batchSize) {
        const batch = providerRows.slice(i, i + batchSize);
        if (!batch.length) continue;
        const values = batch.map((row) => [
          row.provider_id,
          row.state_id,
          row.provider_name,
          row.provider_address,
          row.provider_phone_num,
          row.provider_email,
          row.provider_longitude,
          row.provider_latitude,
          row.provider_provide_prep,
          row.provider_provide_pep,
          row.provider_free_sti_screening,
        ]);

        await sql`
          insert into provider (
            provider_id,
            state_id,
            provider_name,
            provider_address,
            provider_phone_num,
            provider_email,
            provider_longitude,
            provider_latitude,
            provider_provide_prep,
            provider_provide_pep,
            provider_free_sti_screening
          ) values ${sql(values)}
          on conflict (provider_id) do update set
            state_id = excluded.state_id,
            provider_name = excluded.provider_name,
            provider_address = excluded.provider_address,
            provider_phone_num = excluded.provider_phone_num,
            provider_email = excluded.provider_email,
            provider_longitude = excluded.provider_longitude,
            provider_latitude = excluded.provider_latitude,
            provider_provide_prep = excluded.provider_provide_prep,
            provider_provide_pep = excluded.provider_provide_pep,
            provider_free_sti_screening = excluded.provider_free_sti_screening
        `;
      }

      const lastId = providerRows.length ? providerRows[providerRows.length - 1].provider_id : 0;
      if (lastId > 0) {
        await sql`select setval(pg_get_serial_sequence('provider', 'provider_id'), ${lastId}, true)`;
      } else {
        await sql`select setval(pg_get_serial_sequence('provider', 'provider_id'), 1, false)`;
      }

      await sql`commit`;

      console.log(`Inserted or updated ${providerRows.length} provider rows`);
      if (skipped.length) {
        console.log(`Skipped ${skipped.length} rows due to validation issues`);
        for (const entry of skipped.slice(0, 5)) {
          console.log(`  Row ${entry.index}: ${entry.reason}`);
        }
      }
    } catch (error) {
      await sql`rollback`;
      throw error;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (require.main === module) {
  seedProviders()
    .then(() => {
      console.log('Provider seeding completed');
    })
    .catch((error) => {
      console.error('Provider seeding failed', error);
      process.exit(1);
    });
}

export { seedProviders };
