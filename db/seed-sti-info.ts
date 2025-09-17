import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sti } from './schema';

async function seedStiInfo() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql);

  try {
    // Read CSV file
    const csvPath = join(__dirname, 'data', 'sti_data.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Parse CSV data
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const records = lines.slice(1).map(line => {
      const fields = parseCSVLine(line);
      
      return {
        name: fields[0],
        type: fields[1],
        severity: fields[2],
        treatability: fields[3],
        symptomsCommon: JSON.stringify(fields[4].split('|')),
        symptomsWomen: JSON.stringify(fields[5].split('|')),
        symptomsMen: JSON.stringify(fields[6].split('|')),
        symptomsGeneral: JSON.stringify(fields[7].split('|')),
        transmission: JSON.stringify(fields[8].split('|')),
        healthEffects: JSON.stringify(fields[9].split('|')),
        prevention: JSON.stringify(fields[10].split('|')),
        treatment: fields[11],
        malaysianContext: fields[12]
      };
    });

    console.log(`Found ${records.length} records to insert`);

    // Insert data in batches
    const batchSize = 10; // Smaller batch for STI info data
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await db.insert(sti).values(batch);
      insertedCount += batch.length;
      
      console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)}: ${insertedCount}/${records.length} records`);
    }

    console.log(`✅ Successfully inserted ${insertedCount} records into sti table`);
    
  } catch (error) {
    console.error('❌ Error seeding STI info:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Helper function to parse CSV line with quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Run the seed function
if (require.main === module) {
  seedStiInfo()
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedStiInfo };