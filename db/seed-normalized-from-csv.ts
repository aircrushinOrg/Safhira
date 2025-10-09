// Seed normalized schema from CSV files: db/data/sti_data.csv and db/data/std_state.csv
// Usage: pnpm tsx scripts/seed-normalized-from-csv.ts
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

type CsvParseResult = {
  headers: string[];
  rows: string[][];
};

type CacheMap = Map<string, number>;

type SymptomKey = 'symptoms_common' | 'symptoms_women' | 'symptoms_men' | 'symptoms_general';
type SymptomCategory = 'common' | 'women' | 'men' | 'general';

type ColumnKey =
  | 'name'
  | 'type'
  | 'severity'
  | 'treatability'
  | 'symptoms_common'
  | 'symptoms_women'
  | 'symptoms_men'
  | 'symptoms_general'
  | 'transmission'
  | 'health_effects'
  | 'prevention'
  | 'treatment'
  | 'malaysian_context';

type TranslationColumnMap = Record<ColumnKey, string>;
type LocaleKey = 'ms' | 'zh';

type SqlClient = ReturnType<typeof postgres>;

const csvParseLine = (line: string): string[] => {
  const out: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      out.push(field);
      field = '';
    } else {
      field += char;
    }
  }

  out.push(field);
  return out.map((segment) => segment.trim());
};

const parseCSV = (filePath: string): CsvParseResult => {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const lines = fileContents.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = csvParseLine(lines[0]);
  const rows = lines.slice(1).map((line) => csvParseLine(line));
  return { headers, rows };
};

const parseList = (text: string | null | undefined): string[] => {
  if (!text) {
    return [];
  }

  return String(text)
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const normKey = (value: string | null | undefined): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const loadEnvUrl = (): string | null => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const env = fs.readFileSync(path.resolve('.env'), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^DATABASE_URL\s*=\s*(.*)\s*$/);
      if (match) {
        let value = match[1].trim();
        const hasQuotes = (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
        if (hasQuotes) {
          value = value.slice(1, -1);
        }
        return value;
      }
    }
  } catch (error) {
    // Ignore missing .env file
    if (error instanceof Error && error.message) {
      // no-op
    }
  }

  return null;
};

const ensureId = async (
  sql: SqlClient,
  table: string,
  idCol: string,
  textCol: string,
  value: string,
  cache: CacheMap,
): Promise<number | null> => {
  const key = normKey(value);
  if (!key) {
    return null;
  }

  if (cache.has(key)) {
    return cache.get(key) ?? null;
  }

  const found = await sql<{ id: number }[]>`
    select ${sql(idCol)} as id from ${sql(table)} where ${sql(textCol)} = ${value} limit 1
  `;

  if (found.length > 0) {
    const id = found[0]?.id ?? null;
    if (id !== null) {
      cache.set(key, id);
    }
    return id;
  }

  const inserted = await sql<{ id: number }[]>`
    insert into ${sql(table)} (${sql(textCol)}) values (${value}) returning ${sql(idCol)} as id
  `;

  const id = inserted[0]?.id ?? null;
  if (id !== null) {
    cache.set(key, id);
  }

  return id;
};

const main = async (): Promise<void> => {
  const url = loadEnvUrl();
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  const sql = postgres(url, { max: 1, ssl: 'require' });

  try {
    // 1) Seed STI and dictionaries from sti_data.csv
    const stiCsvPath = path.resolve('db', 'data', 'sti_data.csv');
    const { headers: stiHeaders, rows: stiRows } = parseCSV(stiCsvPath);

    if (stiRows.length === 0) {
      console.log('No rows in sti_data.csv');
    }

    const columnIndex = (name: string): number => {
      const index = stiHeaders.indexOf(name);
      if (index === -1) {
        throw new Error(`Column not found in sti_data.csv: ${name}`);
      }
      return index;
    };

    const idxs = {
      name: columnIndex('name'),
      type: columnIndex('type'),
      severity: columnIndex('severity'),
      treatability: columnIndex('treatability'),
      treatment: columnIndex('treatment'),
      malaysian_context: columnIndex('malaysian_context'),
      symptoms_common: columnIndex('symptoms_common'),
      symptoms_women: columnIndex('symptoms_women'),
      symptoms_men: columnIndex('symptoms_men'),
      symptoms_general: columnIndex('symptoms_general'),
      transmission: columnIndex('transmission'),
      health_effects: columnIndex('health_effects'),
      prevention: columnIndex('prevention'),
    } satisfies Record<string, number>;

    const englishRowData: { stiId: number; row: string[] }[] = [];
    const caches: Record<'symptom' | 'transmission' | 'health_effect' | 'prevention', CacheMap> = {
      symptom: new Map(),
      transmission: new Map(),
      health_effect: new Map(),
      prevention: new Map(),
    };

    let stiInserted = 0;

    for (const row of stiRows) {
      const name = row[idxs.name];
      const type = row[idxs.type];
      const severity = row[idxs.severity];
      const treatability = row[idxs.treatability];
      const treatment = row[idxs.treatment];
      const malaysianContext = row[idxs.malaysian_context];

      const existing = await sql<{ sti_id: number }[]>`
        select sti_id from sti where name = ${name} limit 1
      `;

      let stiId: number;
      if (existing.length > 0) {
        stiId = existing[0].sti_id;
        await sql`
          update sti
          set type = ${type},
              severity = ${severity},
              treatability = ${treatability},
              treatment = ${treatment},
              malaysian_context = ${malaysianContext}
          where sti_id = ${stiId}
        `;
      } else {
        const inserted = await sql<{ sti_id: number }[]>`
          insert into sti (name, type, severity, treatability, treatment, malaysian_context)
          values (${name}, ${type}, ${severity}, ${treatability}, ${treatment}, ${malaysianContext})
          returning sti_id
        `;
        stiId = inserted[0].sti_id;
        stiInserted += 1;
      }

      englishRowData.push({ stiId, row });

      const linkSymptoms = async (key: SymptomKey, category: SymptomCategory) => {
        const columnValue = row[idxs[key]] ?? '';
        for (const text of parseList(columnValue)) {
          const id = await ensureId(sql, 'symptom', 'symptom_id', 'symptom_text', text, caches.symptom);
          if (!id) {
            continue;
          }
          await sql`
            insert into sti_symptom (sti_id, symptom_id, sti_symptom_category)
            values (${stiId}, ${id}, ${category})
            on conflict do nothing
          `;
        }
      };

      await linkSymptoms('symptoms_common', 'common');
      await linkSymptoms('symptoms_women', 'women');
      await linkSymptoms('symptoms_men', 'men');
      await linkSymptoms('symptoms_general', 'general');

      for (const text of parseList(row[idxs.transmission])) {
        const id = await ensureId(sql, 'transmission', 'transmission_id', 'transmission_text', text, caches.transmission);
        if (!id) {
          continue;
        }
        await sql`
          insert into sti_transmission (sti_id, transmission_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
      }

      for (const text of parseList(row[idxs.health_effects])) {
        const id = await ensureId(sql, 'health_effect', 'health_effect_id', 'health_effect_text', text, caches.health_effect);
        if (!id) {
          continue;
        }
        await sql`
          insert into sti_health_effect (sti_id, health_effect_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
      }

      for (const text of parseList(row[idxs.prevention])) {
        const id = await ensureId(sql, 'prevention', 'prevention_id', 'prevention_text', text, caches.prevention);
        if (!id) {
          continue;
        }
        await sql`
          insert into sti_prevention (sti_id, prevention_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
      }
    }

    console.log(`STI rows inserted/updated: ${stiInserted} new, ${stiRows.length - stiInserted} existing`);

    const stateCsvPath = path.resolve('db', 'data', 'state.csv');
    let englishStateNames: string[] = [];
    const stateCache: CacheMap = new Map();
    const stateIdByEnglish = new Map<string, number>();

    if (fs.existsSync(stateCsvPath)) {
      const { headers: stateHeaders, rows: stateRows } = parseCSV(stateCsvPath);
      if (stateRows.length === 0) {
        console.warn('No rows found in state.csv');
      } else {
        const stateNameIdx = stateHeaders.indexOf('state_name');
        if (stateNameIdx === -1) {
          throw new Error('Column not found in state.csv: state_name');
        }
        englishStateNames = stateRows.map((row) => row[stateNameIdx]).filter((name) => name && name.length > 0);

        for (const name of englishStateNames) {
          const stateId = await ensureId(sql, 'state', 'state_id', 'state_name', name, stateCache);
          if (stateId !== null) {
            stateIdByEnglish.set(normKey(name), stateId);
          }
        }
      }
    } else {
      console.warn(`state.csv not found at ${stateCsvPath}. Skipping base state seeding.`);
    }

    const translationConfigs: { locale: LocaleKey; fileName: string; columns: TranslationColumnMap }[] = [
      {
        locale: 'ms',
        fileName: 'sti_data_ms.csv',
        columns: {
          name: 'nama',
          type: 'jenis',
          severity: 'keparahan',
          treatability: 'kebolehrawatan',
          symptoms_common: 'gejala_umum',
          symptoms_women: 'gejala_wanita',
          symptoms_men: 'gejala_lelaki',
          symptoms_general: 'gejala_umum_lain',
          transmission: 'cara_jangkitan',
          health_effects: 'kesan_kesihatan',
          prevention: 'pencegahan',
          treatment: 'rawatan',
          malaysian_context: 'konteks_malaysia',
        },
      },
      {
        locale: 'zh',
        fileName: 'sti_data_zh.csv',
        columns: {
          name: '名称',
          type: '类型',
          severity: '严重程度',
          treatability: '可治疗性',
          symptoms_common: '常见症状',
          symptoms_women: '女性症状',
          symptoms_men: '男性症状',
          symptoms_general: '全身症状',
          transmission: '传播方式',
          health_effects: '健康影响',
          prevention: '预防',
          treatment: '治疗',
          malaysian_context: '马来西亚背景',
        },
      },
    ];

    for (const config of translationConfigs) {
      const translationPath = path.resolve('db', 'data', config.fileName);
      if (!fs.existsSync(translationPath)) {
        console.warn(`[${config.locale}] Translation file not found at ${translationPath}, skipping.`);
        continue;
      }

      const { headers: translationHeaders, rows: translationRows } = parseCSV(translationPath);
      if (translationRows.length === 0) {
        console.warn(`[${config.locale}] No rows found in ${config.fileName}, skipping.`);
        continue;
      }

      const translationIdx = {} as Record<ColumnKey, number>;
      for (const key of Object.keys(config.columns) as ColumnKey[]) {
        const headerName = config.columns[key];
        const index = translationHeaders.indexOf(headerName);
        if (index === -1) {
          throw new Error(`[${config.locale}] Column not found in ${config.fileName}: ${headerName}`);
        }
        translationIdx[key] = index;
      }

      if (translationRows.length !== englishRowData.length) {
        console.warn(
          `[${config.locale}] Row count mismatch between English and ${config.fileName}: en=${englishRowData.length}, locale=${translationRows.length}. Proceeding with minimum.`,
        );
      }

      const rowLimit = Math.min(englishRowData.length, translationRows.length);
      let stiTranslationsProcessed = 0;

      const upsertDictionaryTranslations = async (
        englishValues: string[],
        translationValues: string[],
        cache: CacheMap,
        table: string,
        idColumn: string,
        textColumn: string,
        stiId: number,
      ) => {
        const englishCount = englishValues.length;
        const translationCount = translationValues.length;
        if (englishCount !== translationCount && (englishCount > 0 || translationCount > 0)) {
          console.warn(
            `[${config.locale}] ${table} entry count mismatch for STI ID ${stiId}: en=${englishCount}, locale=${translationCount}`,
          );
        }

        const count = Math.min(englishCount, translationCount);
        for (let idx = 0; idx < count; idx++) {
          const englishValue = englishValues[idx];
          const translationValue = translationValues[idx];
          if (!englishValue || !translationValue) {
            continue;
          }
          const cacheKey = normKey(englishValue);
          const dictionaryId = cache.get(cacheKey);
          if (dictionaryId === undefined) {
            console.warn(
              `[${config.locale}] Missing dictionary id for ${table} value "${englishValue}" (STI ID ${stiId})`,
            );
            continue;
          }

          await sql`
            insert into ${sql(table)} (${sql(idColumn)}, locale, ${sql(textColumn)})
            values (${dictionaryId}, ${config.locale}, ${translationValue})
            on conflict (${sql(idColumn)}, locale) do update
            set ${sql(textColumn)} = excluded.${sql(textColumn)}
          `;
        }
      };

      for (let rowIndex = 0; rowIndex < rowLimit; rowIndex++) {
        const englishRecord = englishRowData[rowIndex];
        const translationRow = translationRows[rowIndex];

        const name = translationRow[translationIdx.name] ?? '';
        const type = translationRow[translationIdx.type] ?? '';
        const severity = translationRow[translationIdx.severity] ?? '';
        const treatability = translationRow[translationIdx.treatability] ?? '';
        const treatment = translationRow[translationIdx.treatment] ?? '';
        const malaysianContext = translationRow[translationIdx.malaysian_context] ?? '';

        await sql`
          insert into sti_translations (sti_id, locale, name, type, severity, treatability, treatment, malaysian_context)
          values (${englishRecord.stiId}, ${config.locale}, ${name}, ${type}, ${severity}, ${treatability}, ${treatment}, ${malaysianContext})
          on conflict (sti_id, locale) do update
          set name = excluded.name,
              type = excluded.type,
              severity = excluded.severity,
              treatability = excluded.treatability,
              treatment = excluded.treatment,
              malaysian_context = excluded.malaysian_context
        `;

        const englishCommon = parseList(englishRecord.row[idxs.symptoms_common]);
        const englishWomen = parseList(englishRecord.row[idxs.symptoms_women]);
        const englishMen = parseList(englishRecord.row[idxs.symptoms_men]);
        const englishGeneral = parseList(englishRecord.row[idxs.symptoms_general]);

        const translationCommon = parseList(translationRow[translationIdx.symptoms_common]);
        const translationWomen = parseList(translationRow[translationIdx.symptoms_women]);
        const translationMen = parseList(translationRow[translationIdx.symptoms_men]);
        const translationGeneral = parseList(translationRow[translationIdx.symptoms_general]);

        await upsertDictionaryTranslations(
          englishCommon,
          translationCommon,
          caches.symptom,
          'symptom_translations',
          'symptom_id',
          'symptom_text',
          englishRecord.stiId,
        );
        await upsertDictionaryTranslations(
          englishWomen,
          translationWomen,
          caches.symptom,
          'symptom_translations',
          'symptom_id',
          'symptom_text',
          englishRecord.stiId,
        );
        await upsertDictionaryTranslations(
          englishMen,
          translationMen,
          caches.symptom,
          'symptom_translations',
          'symptom_id',
          'symptom_text',
          englishRecord.stiId,
        );
        await upsertDictionaryTranslations(
          englishGeneral,
          translationGeneral,
          caches.symptom,
          'symptom_translations',
          'symptom_id',
          'symptom_text',
          englishRecord.stiId,
        );

        const englishTransmission = parseList(englishRecord.row[idxs.transmission]);
        const translationTransmission = parseList(translationRow[translationIdx.transmission]);
        await upsertDictionaryTranslations(
          englishTransmission,
          translationTransmission,
          caches.transmission,
          'transmission_translations',
          'transmission_id',
          'transmission_text',
          englishRecord.stiId,
        );

        const englishHealthEffects = parseList(englishRecord.row[idxs.health_effects]);
        const translationHealthEffects = parseList(translationRow[translationIdx.health_effects]);
        await upsertDictionaryTranslations(
          englishHealthEffects,
          translationHealthEffects,
          caches.health_effect,
          'health_effect_translations',
          'health_effect_id',
          'health_effect_text',
          englishRecord.stiId,
        );

        const englishPrevention = parseList(englishRecord.row[idxs.prevention]);
        const translationPrevention = parseList(translationRow[translationIdx.prevention]);
        await upsertDictionaryTranslations(
          englishPrevention,
          translationPrevention,
          caches.prevention,
          'prevention_translations',
          'prevention_id',
          'prevention_text',
          englishRecord.stiId,
        );

        stiTranslationsProcessed += 1;
      }

      console.log(`[${config.locale}] STI translations processed: ${stiTranslationsProcessed}/${rowLimit}`);
    }

    const stateTranslationConfigs: { locale: LocaleKey; fileName: string }[] = [
      { locale: 'ms', fileName: 'state_ms.csv' },
      { locale: 'zh', fileName: 'state_zh.csv' },
    ];

    for (const config of stateTranslationConfigs) {
      const translationPath = path.resolve('db', 'data', config.fileName);
      if (!fs.existsSync(translationPath)) {
        console.warn(`[${config.locale}] State translation file not found at ${translationPath}, skipping.`);
        continue;
      }

      const { headers: translationHeaders, rows: translationRows } = parseCSV(translationPath);
      if (translationRows.length === 0) {
        console.warn(`[${config.locale}] No rows found in ${config.fileName}, skipping.`);
        continue;
      }

      const nameIdx = translationHeaders.indexOf('state_name');
      if (nameIdx === -1) {
        throw new Error(`[${config.locale}] Column not found in ${config.fileName}: state_name`);
      }

      if (englishStateNames.length === 0) {
        console.warn(`[${config.locale}] English state names not available. Skipping state translations.`);
        continue;
      }

      if (translationRows.length !== englishStateNames.length) {
        console.warn(
          `[${config.locale}] State row count mismatch: en=${englishStateNames.length}, locale=${translationRows.length}. Proceeding with minimum.`,
        );
      }

      const rowCount = Math.min(englishStateNames.length, translationRows.length);
      let processed = 0;

      for (let idx = 0; idx < rowCount; idx++) {
        const englishName = englishStateNames[idx];
        const translationName = translationRows[idx][nameIdx];
        if (!englishName || !translationName) {
          continue;
        }

        const stateId = stateIdByEnglish.get(normKey(englishName));
        if (!stateId) {
          console.warn(
            `[${config.locale}] Could not locate state id for English state "${englishName}". Skipping translation entry.`,
          );
          continue;
        }

        await sql`
          insert into state_translations (state_id, locale, state_name)
          values (${stateId}, ${config.locale}, ${translationName})
          on conflict (state_id, locale) do update
          set state_name = excluded.state_name
        `;

        processed += 1;
      }

      console.log(`[${config.locale}] State translations processed: ${processed}/${rowCount}`);
    }

    const stiRowsDb = await sql<{ sti_id: number; name: string }[]>`
      select sti_id, name from sti
    `;
    const stiByKey = new Map<string, number>();
    for (const record of stiRowsDb) {
      stiByKey.set(normKey(record.name), record.sti_id);
    }

    const prevalenceCsvPath = path.resolve('db', 'data', 'std_state.csv');
    const { headers: prevalenceHeaders, rows: prevalenceRows } = parseCSV(prevalenceCsvPath);

    const prevalenceColumnIndex = (name: string): number => {
      const index = prevalenceHeaders.indexOf(name);
      if (index === -1) {
        throw new Error(`Column not found in std_state.csv: ${name}`);
      }
      return index;
    };

    const prevalenceIdx = {
      date: prevalenceColumnIndex('date'),
      state: prevalenceColumnIndex('state'),
      disease: prevalenceColumnIndex('disease'),
      cases: prevalenceColumnIndex('cases'),
      incidence: prevalenceColumnIndex('incidence'),
    } satisfies Record<string, number>;

    const states = Array.from(
      new Set(
        prevalenceRows
          .map((row) => (row[prevalenceIdx.state] ?? '').trim())
          .filter((state) => state.length > 0),
      ),
    );

    const stateIdByName = new Map<string, number>();
    for (const state of states) {
      const existing = await sql<{ state_id: number }[]>`
        select state_id from state where state_name = ${state} limit 1
      `;
      if (existing.length > 0) {
        stateIdByName.set(state, existing[0].state_id);
      } else {
        const inserted = await sql<{ state_id: number }[]>`
          insert into state (state_name) values (${state}) returning state_id
        `;
        stateIdByName.set(state, inserted[0].state_id);
      }
    }

    const diseaseToStiKey = (disease: string): string => {
      const key = normKey(disease);
      if (key === 'hiv') return normKey('Human Immunodeficiency Virus (HIV)');
      if (key === 'aids') return normKey('AIDS');
      if (key === 'gonorrhea') return normKey('Gonorrhea');
      if (key === 'syphillis' || key === 'syphilis') return normKey('Syphilis');
      if (key === 'chlamydia') return normKey('Chlamydia');
      if (key === 'hpv' || key.includes('papillomavirus')) return normKey('Human Papillomavirus (HPV)');
      if (key === 'herpes' || key.includes('hsv')) return normKey('Herpes (HSV-1 & HSV-2)');
      if (stiByKey.has(key)) return key;
      return key;
    };

    const ensureStiForAlias = async (aliasKey: string): Promise<number> => {
      if (stiByKey.has(aliasKey)) {
        const existingId = stiByKey.get(aliasKey);
        if (existingId === undefined) {
          throw new Error(`Unexpected missing STI id for alias: ${aliasKey}`);
        }
        return existingId;
      }

      const displayName = aliasKey
        .split(' ')
        .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : ''))
        .join(' ')
        .trim();

      const name = displayName || 'Unknown STI';
      const inserted = await sql<{ sti_id: number; name: string }[]>`
        insert into sti (name, type, severity, treatability, treatment, malaysian_context)
        values (${name}, ${'Bacterial'}, ${'Medium'}, ${'Manageable'}, ${'N/A'}, ${'Seeded from prevalence CSV'})
        returning sti_id, name
      `;

      const record = inserted[0];
      stiByKey.set(normKey(record.name), record.sti_id);
      return record.sti_id;
    };

    let insertedPrev = 0;
    let updatedPrev = 0;
    let skippedPrev = 0;

    for (const row of prevalenceRows) {
      const year = Number.parseInt(row[prevalenceIdx.date] ?? '0', 10);
      const stateName = (row[prevalenceIdx.state] ?? '').trim();
      const disease = row[prevalenceIdx.disease] ?? '';
      const casesValue = Number.parseInt(row[prevalenceIdx.cases] ?? '0', 10);
      const cases = Number.isFinite(casesValue) ? casesValue : 0;
      const incidence = row[prevalenceIdx.incidence] ?? '0';

      if (!stateName) {
        skippedPrev += 1;
        continue;
      }

      const stateId = stateIdByName.get(stateName);
      if (stateId === undefined) {
        skippedPrev += 1;
        continue;
      }

      const stiKey = diseaseToStiKey(disease);
      let stiId = stiByKey.get(stiKey);
      if (!stiId) {
        stiId = await ensureStiForAlias(stiKey);
      }

      const existing = await sql<{ exists: number }[]>`
        select 1 as exists
        from prevalence
        where sti_id = ${stiId} and state_id = ${stateId} and prevalence_year = ${year}
        limit 1
      `;

      if (existing.length > 0) {
        await sql`
          update prevalence
          set prevalence_cases = ${cases},
              prevalence_incidence = ${incidence}
          where sti_id = ${stiId} and state_id = ${stateId} and prevalence_year = ${year}
        `;
        updatedPrev += 1;
      } else {
        await sql`
          insert into prevalence (sti_id, state_id, prevalence_year, prevalence_cases, prevalence_incidence)
          values (${stiId}, ${stateId}, ${year}, ${cases}, ${incidence})
        `;
        insertedPrev += 1;
      }
    }

    console.log(`Prevalence upserted: inserted=${insertedPrev}, updated=${updatedPrev}, skipped=${skippedPrev}`);
    console.log('Seeding completed.');
  } finally {
    await sql.end({ timeout: 5 });
  }
};

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
