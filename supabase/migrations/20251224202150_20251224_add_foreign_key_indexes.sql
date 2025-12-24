/*
  # Add Foreign Key Indexes for Performance

  1. Foreign Key Indexes
    - Add indexes on all foreign key columns to improve query performance
    - These indexes prevent full table scans when joining tables
    
  2. Cleanup
    - Drop unused index idx_study_group_members_user
*/

-- Add indexes on foreign key columns for performance

CREATE INDEX IF NOT EXISTS idx_annotations_note_id ON annotations(note_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON annotations(user_id);

CREATE INDEX IF NOT EXISTS idx_flashcards_note_id ON flashcards(note_id);

CREATE INDEX IF NOT EXISTS idx_prediction_runs_user_id ON prediction_runs(user_id);

CREATE INDEX IF NOT EXISTS idx_question_bank_user_id ON question_bank(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_note_id ON quiz_attempts(note_id);

CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON study_groups(creator_id);

CREATE INDEX IF NOT EXISTS idx_study_tips_user_id ON study_tips(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_id ON user_achievements(badge_id);

CREATE INDEX IF NOT EXISTS idx_voice_notes_note_id ON voice_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON voice_notes(user_id);

-- Drop unused index
DROP INDEX IF EXISTS idx_study_group_members_user;
