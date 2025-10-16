import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { quizQuestionTranslations, quizQuestions } from './schema';

type ParsedCsvRow = {
  id?: number;
  statement: string;
  isTrue: boolean;
  explanation: string;
  category: string;
};

type QuizQuestionInsert = typeof quizQuestions.$inferInsert;
type QuizQuestionTranslationInsert = typeof quizQuestionTranslations.$inferInsert;

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
  if (normalized.startsWith('symptom')) return 'symptoms';
  if (normalized.startsWith('health')) return 'health_effects';
  if (normalized.startsWith('transmission')) return 'transmission';
  if (normalized.startsWith('prevention')) return 'prevention';
  if (normalized.startsWith('treatment')) return 'treatment';
  return isTrue ? 'facts' : 'myths';
}

function parseCsv(content: string, options: { normalizeCategory?: boolean } = {}): ParsedCsvRow[] {
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
  const categoryIdx = optionalColumnIndex(headers, 'category');

  const normalize = options.normalizeCategory ?? true;
  const records: ParsedCsvRow[] = [];

  for (const row of dataRows) {
    const statement = (row[statementIdx] ?? '').trim();
    if (!statement) continue;

    const rawCategory = categoryIdx >= 0 ? row[categoryIdx] : undefined;
    const isTrue = parseBoolean(row[isTrueIdx], rawCategory);
    const explanation = (row[explanationIdx] ?? '').trim();
    const category = normalize ? normalizeCategory(rawCategory, isTrue) : (rawCategory ?? '').trim();

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

export async function seedQuizQuestionsWithTranslations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const dataDir = join(__dirname, 'data');
  const englishCsv = readFileSync(join(dataDir, 'myth_true_questionaire.csv'), 'utf8');
  const malayCsv = readFileSync(join(dataDir, 'myth_true_questionaire_ms.csv'), 'utf8');
  const chineseCsv = readFileSync(join(dataDir, 'myth_true_questionaire_zh.csv'), 'utf8');

  const englishRecords = parseCsv(englishCsv, { normalizeCategory: true });
  const malayRecords = parseCsv(malayCsv, { normalizeCategory: false });
  const chineseRecords = parseCsv(chineseCsv, { normalizeCategory: false });

  if (!englishRecords.length) {
    console.warn('No English quiz questions found to seed.');
    return;
  }

  if (englishRecords.length !== malayRecords.length || englishRecords.length !== chineseRecords.length) {
    throw new Error(
      `Translation record counts mismatch. English: ${englishRecords.length}, Malay: ${malayRecords.length}, Chinese: ${chineseRecords.length}`,
    );
  }

  const sqlClient = postgres(DATABASE_URL);
  const db = drizzle(sqlClient);

  try {
    await db.delete(quizQuestionTranslations);
    await db.delete(quizQuestions);

    const batchSize = 100;
    const insertedQuestionIds: number[] = [];

    for (let i = 0; i < englishRecords.length; i += batchSize) {
      const batch = englishRecords.slice(i, i + batchSize);
      if (!batch.length) continue;

      const timestamp = new Date();

      const values: QuizQuestionInsert[] = batch.map((record) => {
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

      const inserted = await db.insert(quizQuestions).values(values).returning({ id: quizQuestions.id });
      insertedQuestionIds.push(...inserted.map((row) => row.id));
    }

    if (insertedQuestionIds.length !== englishRecords.length) {
      throw new Error('Inserted question count does not match source records.');
    }

    const translationValues: QuizQuestionTranslationInsert[] = [];
    for (let idx = 0; idx < insertedQuestionIds.length; idx++) {
      const questionId = insertedQuestionIds[idx];
      const malayRecord = malayRecords[idx];
      const chineseRecord = chineseRecords[idx];
      const englishRecord = englishRecords[idx];

      translationValues.push(
        {
          questionId,
          locale: 'ms',
          statement: malayRecord.statement,
          explanation: malayRecord.explanation,
          category: malayRecord.category || englishRecord.category,
        },
        {
          questionId,
          locale: 'zh',
          statement: chineseRecord.statement,
          explanation: chineseRecord.explanation,
          category: chineseRecord.category || englishRecord.category,
        },
      );
    }

    for (let i = 0; i < translationValues.length; i += batchSize) {
      const batch = translationValues.slice(i, i + batchSize);
      if (!batch.length) continue;
      await db.insert(quizQuestionTranslations).values(batch);
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

    console.log(`Inserted ${englishRecords.length} quiz questions with Malay and Chinese translations.`);
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

if (require.main === module) {
  seedQuizQuestionsWithTranslations()
    .then(() => {
      console.log('Quiz question + translation seeding completed.');
    })
    .catch((error) => {
      console.error('Seeding quiz questions with translations failed.', error);
      process.exit(1);
    });
}
