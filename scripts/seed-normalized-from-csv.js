// Seed normalized schema from CSV files: db/data/sti_data.csv and db/data/std_state.csv
// Usage: node scripts/seed-normalized-from-csv.js
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

function csvParseLine(line) {
  const out = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      out.push(field);
      field = '';
    } else {
      field += c;
    }
  }
  out.push(field);
  return out.map((s) => s.trim());
}

function parseCSV(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = csvParseLine(lines[0]);
  const rows = lines.slice(1).map((line) => csvParseLine(line));
  return { headers, rows };
}

function parseList(text) {
  if (!text) return [];
  return String(text)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normKey(s) {
  return String(s || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function loadEnvUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = fs.readFileSync(path.resolve('.env'), 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL\s*=\s*(.*)\s*$/);
      if (m) {
        let v = m[1].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        return v;
      }
    }
  } catch (_) {}
  return null;
}

async function main() {
  const url = loadEnvUrl();
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1, ssl: 'require' });

  try {
    // 1) Seed STI and dictionaries from sti_data.csv
    const stiCsv = path.resolve('db', 'data', 'sti_data.csv');
    const { headers: stiHeaders, rows: stiRows } = parseCSV(stiCsv);
    if (!stiRows.length) {
      console.log('No rows in sti_data.csv');
    }

    const col = (name) => {
      const idx = stiHeaders.indexOf(name);
      if (idx === -1) throw new Error(`Column not found in sti_data.csv: ${name}`);
      return idx;
    };

    const idxs = {
      name: col('name'),
      type: col('type'),
      severity: col('severity'),
      treatability: col('treatability'),
      treatment: col('treatment'),
      malaysian_context: col('malaysian_context'),
      symptoms_common: col('symptoms_common'),
      symptoms_women: col('symptoms_women'),
      symptoms_men: col('symptoms_men'),
      symptoms_general: col('symptoms_general'),
      transmission: col('transmission'),
      health_effects: col('health_effects'),
      prevention: col('prevention'),
    };

    const caches = {
      symptom: new Map(),
      transmission: new Map(),
      health_effect: new Map(),
      prevention: new Map(),
    };

    async function ensureId(table, idCol, textCol, value, cache) {
      const key = normKey(value);
      if (!key) return null;
      if (cache.has(key)) return cache.get(key);
      const found = await sql`select ${sql(idCol)} as id from ${sql(table)} where ${sql(textCol)} = ${value} limit 1`;
      if (found.length) {
        cache.set(key, found[0].id);
        return found[0].id;
      }
      const ins = await sql`insert into ${sql(table)} (${sql(textCol)}) values (${value}) returning ${sql(idCol)} as id`;
      const id = ins[0].id;
      cache.set(key, id);
      return id;
    }

    let stiInserted = 0;
    for (const row of stiRows) {
      const name = row[idxs.name];
      const type = row[idxs.type];
      const severity = row[idxs.severity];
      const treatability = row[idxs.treatability];
      const treatment = row[idxs.treatment];
      const malaysianContext = row[idxs.malaysian_context];

      // Upsert STI by name
      const existing = await sql`select sti_id from sti where name = ${name} limit 1`;
      let stiId;
      if (existing.length) {
        stiId = existing[0].sti_id;
        await sql`update sti set type=${type}, severity=${severity}, treatability=${treatability}, treatment=${treatment}, malaysian_context=${malaysianContext} where sti_id=${stiId}`;
      } else {
        const ins = await sql`insert into sti (name, type, severity, treatability, treatment, malaysian_context) values (${name}, ${type}, ${severity}, ${treatability}, ${treatment}, ${malaysianContext}) returning sti_id`;
        stiId = ins[0].sti_id;
        stiInserted++;
      }

      // Link symptoms by categories
      async function linkSymptoms(list, category) {
        for (const txt of parseList(row[idxs[list]])) {
          const id = await ensureId('symptom', 'symptom_id', 'symptom_text', txt, caches.symptom);
          if (!id) continue;
          await sql`insert into sti_symptom (sti_id, symptom_id, sti_symptom_category) values (${stiId}, ${id}, ${category}) on conflict do nothing`;
        }
      }
      await linkSymptoms('symptoms_common', 'common');
      await linkSymptoms('symptoms_women', 'women');
      await linkSymptoms('symptoms_men', 'men');
      await linkSymptoms('symptoms_general', 'general');

      // Transmission
      for (const txt of parseList(row[idxs.transmission])) {
        const id = await ensureId('transmission', 'transmission_id', 'transmission_text', txt, caches.transmission);
        if (!id) continue;
        await sql`insert into sti_transmission (sti_id, transmission_id) values (${stiId}, ${id}) on conflict do nothing`;
      }
      // Health effects
      for (const txt of parseList(row[idxs.health_effects])) {
        const id = await ensureId('health_effect', 'health_effect_id', 'health_effect_text', txt, caches.health_effect);
        if (!id) continue;
        await sql`insert into sti_health_effect (sti_id, health_effect_id) values (${stiId}, ${id}) on conflict do nothing`;
      }
      // Prevention
      for (const txt of parseList(row[idxs.prevention])) {
        const id = await ensureId('prevention', 'prevention_id', 'prevention_text', txt, caches.prevention);
        if (!id) continue;
        await sql`insert into sti_prevention (sti_id, prevention_id) values (${stiId}, ${id}) on conflict do nothing`;
      }
    }
    console.log(`STI rows inserted/updated: ${stiInserted} new, ${stiRows.length - stiInserted} existing`);

    // Build STI name lookup
    const stiRowsDb = await sql`select sti_id, name from sti`;
    const stiByKey = new Map();
    for (const r of stiRowsDb) stiByKey.set(normKey(r.name), r.sti_id);

    // 2) Seed states and prevalence from std_state.csv
    const prevCsv = path.resolve('db', 'data', 'std_state.csv');
    const { headers: pHeaders, rows: pRows } = parseCSV(prevCsv);
    const pCol = (n) => {
      const i = pHeaders.indexOf(n);
      if (i === -1) throw new Error(`Column not found in std_state.csv: ${n}`);
      return i;
    };
    const pIdx = {
      date: pCol('date'),
      state: pCol('state'),
      disease: pCol('disease'),
      cases: pCol('cases'),
      incidence: pCol('incidence'),
    };

    // Ensure states
    const states = Array.from(new Set(pRows.map((r) => r[pIdx.state].trim()).filter(Boolean)));
    const stateIdByName = new Map();
    for (const s of states) {
      const found = await sql`select state_id from state where state_name=${s} limit 1`;
      if (found.length) stateIdByName.set(s, found[0].state_id);
      else {
        const ins = await sql`insert into state (state_name) values (${s}) returning state_id`;
        stateIdByName.set(s, ins[0].state_id);
      }
    }

    function diseaseToStiKey(d) {
      const k = normKey(d);
      if (k === 'hiv' || k === 'aids') return normKey('Human Immunodeficiency Virus (HIV)');
      if (k === 'gonorrhea') return normKey('Gonorrhea');
      if (k === 'syphillis' || k === 'syphilis') return normKey('Syphilis');
      if (k === 'chlamydia') return normKey('Chlamydia');
      if (k === 'hpv' || k.includes('papillomavirus')) return normKey('Human Papillomavirus (HPV)');
      if (k === 'herpes' || k.includes('hsv')) return normKey('Herpes (HSV-1 & HSV-2)');
      if (stiByKey.has(k)) return k;
      return k;
    }

    async function ensureStiForAlias(aliasKey) {
      if (stiByKey.has(aliasKey)) return stiByKey.get(aliasKey);
      // Create placeholder STI row for unknown diseases
      const displayName = aliasKey
        .split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ');
      const name = displayName || 'Unknown STI';
      const ins = await sql`insert into sti (name, type, severity, treatability, treatment, malaysian_context) values (${name}, ${'Bacterial'}, ${'Medium'}, ${'Manageable'}, ${'N/A'}, ${'Seeded from prevalence CSV'}) returning sti_id, name`;
      stiByKey.set(normKey(ins[0].name), ins[0].sti_id);
      return ins[0].sti_id;
    }

    let insertedPrev = 0, updatedPrev = 0, skippedPrev = 0;
    for (const r of pRows) {
      const year = parseInt(r[pIdx.date], 10);
      const stateName = r[pIdx.state];
      const disease = r[pIdx.disease];
      const cases = parseInt(r[pIdx.cases], 10) || 0;
      const incidence = r[pIdx.incidence];
      const sId = stateIdByName.get(stateName);
      const stiKey = diseaseToStiKey(disease);
      let stiId = stiByKey.get(stiKey);
      if (!stiId) stiId = await ensureStiForAlias(stiKey);

      // With PK (sti_id, state_id, prevalence_year) we store every year's row
      const found = await sql`select 1 from prevalence where sti_id=${stiId} and state_id=${sId} and prevalence_year=${year} limit 1`;
      if (found.length) {
        await sql`update prevalence set prevalence_cases=${cases}, prevalence_incidence=${incidence} where sti_id=${stiId} and state_id=${sId} and prevalence_year=${year}`;
        updatedPrev++;
      } else {
        await sql`insert into prevalence (sti_id, state_id, prevalence_year, prevalence_cases, prevalence_incidence) values (${stiId}, ${sId}, ${year}, ${cases}, ${incidence})`;
        insertedPrev++;
      }
    }
    console.log(`Prevalence upserted: inserted=${insertedPrev}, updated=${updatedPrev}, skipped=${skippedPrev}`);

    console.log('Seeding completed.');
  } finally {
    // Close connection
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
