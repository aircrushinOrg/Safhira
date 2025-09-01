import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { stiState } from './schema';

async function seedStiData() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = postgres(DATABASE_URL);
  const db = drizzle(sql);

  try {
    // Read CSV file
    const csvPath = join(__dirname, 'data', 'std_state.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Parse CSV data
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    const records = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        date: parseInt(values[0]),
        state: values[1],
        disease: values[2],
        cases: parseInt(values[3]),
        incidence: values[4] // Keep as string for numeric type
      };
    });

    console.log(`Found ${records.length} records to insert`);

    // Insert data in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await db.insert(stiState).values(batch);
      insertedCount += batch.length;
      
      console.log(`Inserted batch ${Math.ceil((i + 1) / batchSize)}: ${insertedCount}/${records.length} records`);
    }

    console.log(`✅ Successfully inserted ${insertedCount} records into stiState table`);
    
  } catch (error) {
    console.error('❌ Error seeding STI data:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the seed function
if (require.main === module) {
  seedStiData()
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedStiData };