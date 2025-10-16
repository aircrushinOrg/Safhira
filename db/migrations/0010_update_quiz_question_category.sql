-- Update quiz question categories to the unified value "general"
UPDATE "quiz_questions"
SET "category" = 'general'
WHERE "category" IN ('myths', 'facts');

