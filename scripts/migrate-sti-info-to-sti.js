// One-off data migration from legacy sti_info to normalized STI schema.
// Prereqs:
// 1) Run migrations to create new tables (sti, symptom, sti_symptom, transmission, sti_transmission,
//    health_effect, sti_health_effect, prevention, sti_prevention). Do NOT drop sti_info until this runs.
// 2) Set DATABASE_URL env.
// Run: npm run migrate:sti-info

const postgres = require('postgres');

function parseList(str) {
  if (!str) return [];
  const s = String(str).trim();
  if (!s) return [];
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) {
      return arr.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch (_) {
    // Fallback: split by | or comma
    return s.split(/\||,/g).map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

function normKey(s) {
  return String(s || '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function main() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

  const sql = postgres(DATABASE_URL, { max: 1 });
  try {
    // Check source table exists
    const exists = await sql`select to_regclass('public.sti_info') as t`;
    if (!exists?.[0]?.t) {
      console.log('No sti_info table found. Nothing to migrate.');
      return;
    }

    const rows = await sql`
      select 
        name,
        type,
        severity,
        treatability,
        treatment,
        malaysian_context,
        symptoms_common,
        symptoms_women,
        symptoms_men,
        symptoms_general,
        transmission,
        health_effects,
        prevention
      from sti_info
      order by name
    `;

    const symCache = new Map(); // key -> id
    const transCache = new Map();
    const heCache = new Map();
    const prevCache = new Map();

    async function ensureId(table, idCol, textCol, value, cache) {
      const key = normKey(value);
      if (!key) return null;
      if (cache.has(key)) return cache.get(key);
      const found = await sql`
        select ${sql(idCol)} as id from ${sql(table)} where ${sql(textCol)} = ${value} limit 1
      `;
      if (found.length) {
        cache.set(key, found[0].id);
        return found[0].id;
      }
      const inserted = await sql`
        insert into ${sql(table)} (${sql(textCol)}) values (${value}) returning ${sql(idCol)} as id
      `;
      const id = inserted[0].id;
      cache.set(key, id);
      return id;
    }

    let countSti = 0;
    let countSymLinks = 0;
    let countTransLinks = 0;
    let countHeLinks = 0;
    let countPrevLinks = 0;

    for (const r of rows) {
      const name = r.name;
      const type = r.type;
      const severity = r.severity;
      const treatability = r.treatability;
      const treatment = r.treatment;
      const malaysianContext = r.malaysian_context;

      // Insert STI row, avoiding duplicates by name if already migrated
      const existing = await sql`select sti_id from sti where name = ${name} limit 1`;
      let stiId;
      if (existing.length) {
        stiId = existing[0].sti_id;
      } else {
        const ins = await sql`
          insert into sti (name, type, severity, treatability, treatment, malaysian_context)
          values (${name}, ${type}, ${severity}, ${treatability}, ${treatment}, ${malaysianContext})
          returning sti_id
        `;
        stiId = ins[0].sti_id;
        countSti++;
      }

      // Symptoms by categories
      const symCommon = parseList(r.symptoms_common);
      const symWomen = parseList(r.symptoms_women);
      const symMen = parseList(r.symptoms_men);
      const symGeneral = parseList(r.symptoms_general);

      async function linkSymptoms(list, category) {
        for (const txt of list) {
          const id = await ensureId('symptom', 'symptom_id', 'symptom_text', txt, symCache);
          if (!id) continue;
          await sql`
            insert into sti_symptom (sti_id, symptom_id, sti_symptom_category)
            values (${stiId}, ${id}, ${category})
            on conflict do nothing
          `;
          countSymLinks++;
        }
      }
      await linkSymptoms(symCommon, 'common');
      await linkSymptoms(symWomen, 'women');
      await linkSymptoms(symMen, 'men');
      await linkSymptoms(symGeneral, 'general');

      // Transmission
      const transmissions = parseList(r.transmission);
      for (const txt of transmissions) {
        const id = await ensureId('transmission', 'transmission_id', 'transmission_text', txt, transCache);
        if (!id) continue;
        await sql`
          insert into sti_transmission (sti_id, transmission_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
        countTransLinks++;
      }

      // Health effects
      const effects = parseList(r.health_effects);
      for (const txt of effects) {
        const id = await ensureId('health_effect', 'health_effect_id', 'health_effect_text', txt, heCache);
        if (!id) continue;
        await sql`
          insert into sti_health_effect (sti_id, health_effect_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
        countHeLinks++;
      }

      // Prevention
      const prevs = parseList(r.prevention);
      for (const txt of prevs) {
        const id = await ensureId('prevention', 'prevention_id', 'prevention_text', txt, prevCache);
        if (!id) continue;
        await sql`
          insert into sti_prevention (sti_id, prevention_id)
          values (${stiId}, ${id})
          on conflict do nothing
        `;
        countPrevLinks++;
      }
    }

    console.log(`Migrated STI rows inserted: ${countSti}`);
    console.log(`Symptom links inserted: ${countSymLinks}`);
    console.log(`Transmission links inserted: ${countTransLinks}`);
    console.log(`Health effect links inserted: ${countHeLinks}`);
    console.log(`Prevention links inserted: ${countPrevLinks}`);

    console.log('Done. You may drop sti_info after verifying data.');
  } finally {
    // Close connection
    // postgres() returns a function with .end()
    // eslint-disable-next-line no-unsafe-finally
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

