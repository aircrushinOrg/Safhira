// Simple SQL applier for Neon using postgres package
// Usage: node scripts/apply-sql.js path/to/file.sql
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

function loadEnvUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const txt = fs.readFileSync(envPath, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL\s*=\s*(.*)\s*$/);
      if (m) {
        let v = m[1].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        return v;
      }
    }
  } catch (_) {}
  return null;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/apply-sql.js <sql-file>');
    process.exit(1);
  }
  const url = loadEnvUrl();
  if (!url) {
    console.error('DATABASE_URL not found in env or .env');
    process.exit(1);
  }
  const sql = postgres(url, { max: 1, ssl: 'require' });
  try {
    const text = fs.readFileSync(path.resolve(file), 'utf8');
    const statements = text
      .split(/;\s*(?:--.*)?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      await sql.unsafe(stmt);
    }
    console.log(`Applied SQL from ${file}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
