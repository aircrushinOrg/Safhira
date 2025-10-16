-- Add localized category support for quiz question translations
ALTER TABLE "quiz_question_translations"
ADD COLUMN "category" varchar(255);

-- Backfill existing translation rows with their source question category
UPDATE "quiz_question_translations" AS qt
SET "category" = qq."category"
FROM "quiz_questions" AS qq
WHERE qq."id" = qt."question_id" AND qt."category" IS NULL;

-- Ensure the new category column always has a value
ALTER TABLE "quiz_question_translations"
ALTER COLUMN "category" SET NOT NULL;
