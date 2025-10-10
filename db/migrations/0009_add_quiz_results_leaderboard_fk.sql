INSERT INTO quiz_leaderboard_stats (nickname)
SELECT DISTINCT nickname
FROM quiz_results
ON CONFLICT (nickname) DO NOTHING;

ALTER TABLE quiz_results
    ADD CONSTRAINT quiz_results_nickname_fk
    FOREIGN KEY (nickname)
    REFERENCES quiz_leaderboard_stats (nickname)
    ON DELETE CASCADE
    ON UPDATE CASCADE;
