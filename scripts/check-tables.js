const postgres = require('postgres');
const fs = require('fs');

function getUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const t = fs.readFileSync('.env', 'utf8');
  for (const l of t.split(/\r?\n/)) {
    if (l.startsWith('DATABASE_URL')) {
      return l.split('=', 2)[1].trim().replace(/^['\"]|['\"]$/g, '');
    }
  }
}

(async () => {
  const url = getUrl();
  const sql = postgres(url, { ssl: 'require' });
  try {
    const r = await sql`select to_regclass('public.provider') as provider, to_regclass('public.state') as state`;
    console.log(r[0]);
  } finally {
    await sql.end({ timeout: 5 });
  }
})().catch((e) => { console.error(e); process.exit(1); });
