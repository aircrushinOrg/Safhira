import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { quizQuestions } from './schema';

type ParsedCsvRow = {
  id?: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
};

type QuizQuestionInsert = typeof quizQuestions.$inferInsert;

function splitCsvIntoRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') {
        i++;
      }
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((value) => value.trim().length > 0));
}

function columnIndex(headers: string[], key: string): number {
  const idx = headers.findIndex((header) => header.toLowerCase().includes(key));
  if (idx === -1) {
    throw new Error(`Unable to locate column for "${key}" in CSV headers: ${headers.join(', ')}`);
  }
  return idx;
}

function optionalColumnIndex(headers: string[], key: string): number {
  return headers.findIndex((header) => header.toLowerCase().includes(key));
}

function parseBoolean(value: string | undefined, fallbackCategory: string | undefined): boolean {
  const normalized = (value ?? '').trim().toLowerCase();
  if (['true', 't', 'yes', 'y', '1', 'fact', 'facts'].includes(normalized)) {
    return true;
  }
  if (['false', 'f', 'no', 'n', '0', 'myth', 'myths'].includes(normalized)) {
    return false;
  }

  const categoryNormalized = (fallbackCategory ?? '').trim().toLowerCase();
  if (categoryNormalized.startsWith('fact')) return true;
  if (categoryNormalized.startsWith('myth')) return false;

  throw new Error(`Unable to derive boolean value from "${value}"`);
}

function normalizeCategory(value: string | undefined, isTrue: boolean): string {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized.startsWith('myth')) return 'myths';
  if (normalized.startsWith('fact')) return 'facts';
  if (normalized.startsWith('general')) return 'general';
  if (normalized.startsWith('sti')) return 'sti';
  return isTrue ? 'facts' : 'myths';
}

function parseCsv(content: string): ParsedCsvRow[] {
  const rows = splitCsvIntoRows(content);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  const idIdx = optionalColumnIndex(headers, 'id');
  const statementIdx = columnIndex(headers, 'statement');
  const isTrueIdx = columnIndex(headers, 'is_true');
  const explanationIdx = columnIndex(headers, 'explanation');
  const categoryIdx = columnIndex(headers, 'category');

  const records: ParsedCsvRow[] = [];

  for (const row of dataRows) {
    const statement = (row[statementIdx] ?? '').trim();
    if (!statement) continue;

    const rawCategory = row[categoryIdx];
    const isTrue = parseBoolean(row[isTrueIdx], rawCategory);
    const explanation = (row[explanationIdx] ?? '').trim();
    const category = normalizeCategory(rawCategory, isTrue);

    let id: number | undefined;
    if (idIdx >= 0) {
      const rawId = (row[idIdx] ?? '').trim();
      if (rawId) {
        const parsed = Number(rawId);
        if (Number.isFinite(parsed)) {
          id = parsed;
        } else {
          console.warn(`Skipping invalid id value "${rawId}" for statement "${statement}".`);
        }
      }
    }

    records.push({
      id,
      statement,
      isTrue,
      explanation,
      category,
    });
  }

  return records;
}

export async function seedQuizQuestions() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const csvPath = join(__dirname, 'data', 'myth_true_questionaire.csv');
  const csvContent = readFileSync(csvPath, 'utf8');
  const records = parseCsv(csvContent);

  if (!records.length) {
    console.warn('No quiz questions found to seed.');
    return;
  }

  const sqlClient = postgres(DATABASE_URL);
  const db = drizzle(sqlClient);

  try {
    await db.delete(quizQuestions);

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      if (!batch.length) continue;

      const values: QuizQuestionInsert[] = batch.map((record) => {
        const timestamp = new Date();
        const insertRecord: QuizQuestionInsert = {
          statement: record.statement,
          isTrue: record.isTrue,
          explanation: record.explanation,
          category: record.category,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        if (record.id !== undefined) {
          insertRecord.id = record.id;
        }

        return insertRecord;
      });

      await db.insert(quizQuestions).values(values);
    }

    const maxIdResult = await sqlClient<{ max: number | null }[]>`
      select max(id) as max from quiz_questions
    `;
    const maxId = maxIdResult[0]?.max ?? null;

    if (maxId !== null) {
      await sqlClient`
        select setval(
          pg_get_serial_sequence('quiz_questions', 'id'),
          ${maxId},
          true
        )
      `;
    } else {
      await sqlClient`
        select setval(
          pg_get_serial_sequence('quiz_questions', 'id'),
          1,
          false
        )
      `;
    }

    const myths = records.filter((record) => !record.isTrue).length;
    const facts = records.filter((record) => record.isTrue).length;

    console.log(`Inserted ${records.length} quiz questions (${myths} myths, ${facts} facts).`);
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

if (require.main === module) {
  seedQuizQuestions()
    .then(() => {
      console.log('Quiz question seeding completed.');
    })
    .catch((error) => {
      console.error('Quiz question seeding failed.', error);
      process.exit(1);
    });
}
