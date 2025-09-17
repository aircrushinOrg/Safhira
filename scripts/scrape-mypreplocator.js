// Simple scraper for https://mypreplocator.com/ using their AJAX endpoint
// Saves full clinic list (including PEP/PrEP-related fields) to db/data/mypreplocator.json

// Requires Node 18+ for global fetch
// Run: npm run scrape:myprep

const fs = require('fs');
const path = require('path');

const CENTER = { lat: 4.210484, lng: 101.975766 }; // Malaysia center
const RADIUS_KM = 5000;
const MAX_RESULTS = 2000;

async function main() {
  const url = new URL('https://mypreplocator.com/wp-admin/admin-ajax.php');
  url.searchParams.set('lang', 'en');
  url.searchParams.set('action', 'store_search');
  url.searchParams.set('lat', String(CENTER.lat));
  url.searchParams.set('lng', String(CENTER.lng));
  url.searchParams.set('max_results', String(MAX_RESULTS));
  url.searchParams.set('search_radius', String(RADIUS_KM));
  url.searchParams.set('autoload', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; scrape-mypreplocator/1.0) Node.js',
      'Referer': 'https://mypreplocator.com/',
      // Mimic language cookie set by the site (helps avoid some blockers)
      'Cookie': 'pll_language=en',
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Basic normalization: map to a shape close to db schema (non-breaking)
  const normalized = data.map((x) => ({
    source: 'mypreplocator',
    externalId: x.id,
    name: x.store,
    address: x.address || '',
    address2: x.address2 || '',
    city: x.city || '',
    state: x.state || '',
    zip: x.zip || '',
    country: x.country || '',
    lat: x.lat,
    lng: x.lng,
    phone: x.phone || '',
    fax: x.fax || '',
    email: x.email || '',
    url: x.url || '',
    hoursHtml: x.hours || '',
    providesPrep: true, // All listed provide PrEP (site is a PrEP locator)
    providesPep: (x.provides_pep || '').toLowerCase() === 'yes',
    allowingWalkIns: x.allowing_walk_ins || '',
    needReferralLetter: (x.need_referral_letter || '').toLowerCase() === 'yes',
    dispensePrepOnsite: x.dispense_prep_onsite || '',
    raw: x, // keep original row for traceability
  }));

  const outDir = path.join(__dirname, '..', 'db', 'data');
  const outPath = path.join(outDir, 'mypreplocator.json');
  await fs.promises.mkdir(outDir, { recursive: true });
  await fs.promises.writeFile(outPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`Saved ${normalized.length} clinics to ${path.relative(process.cwd(), outPath)}`);

  // Also export to CSV
  const csvHeaders = [
    'source',
    'externalId',
    'name',
    'address',
    'address2',
    'city',
    'state',
    'zip',
    'country',
    'lat',
    'lng',
    'phone',
    'fax',
    'email',
    'url',
    'providesPrep',
    'providesPep',
    'allowingWalkIns',
    'needReferralLetter',
    'dispensePrepOnsite',
    'hoursHtml'
  ];

  const toCsv = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const csvRows = normalized.map((row) =>
    csvHeaders.map((h) => toCsv(row[h])).join(',')
  );
  const csv = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvPath = path.join(outDir, 'mypreplocator.csv');
  await fs.promises.writeFile(csvPath, csv, 'utf8');
  console.log(`Saved CSV to ${path.relative(process.cwd(), csvPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
