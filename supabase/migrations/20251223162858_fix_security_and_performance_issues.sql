/*
  # Fix Security and Performance Issues
  
  This migration addresses critical database security and performance issues:
  
  1. Missing Foreign Key Indexes
     - Add index on concept_map(user_id)
     - Add index on flashcard_reviews(flashcard_id)
     - Add index on flashcards(note_id)
     - Add index on quiz_attempts(note_id)
     - Add index on user_achievements(badge_id)
     - Add index on voice_notes(note_id)
  
  2. RLS Policy Optimization
     - Replace auth.uid() with (select auth.uid()) in all policies
     - This prevents re-evaluation for each row, significantly improving query performance
     - Affects policies on: notes, quiz_attempts, study_sessions, prediction_runs,
       user_stats, user_achievements, flashcards, flashcard_reviews, annotations,
       voice_notes, study_groups, study_group_members, question_bank, study_tips,
       topic_difficulty_stats
  
  3. Missing RLS Policies
     - Add policies for concept_map table (currently has RLS enabled but no policies)
  
  Security Notes:
  - All policies maintain strict user data isolation
  - Only authenticated users can access their own data
  - Performance improvements do not compromise security
*/

-- ============================================================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_concept_map_user_id ON concept_map(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_flashcard_id ON flashcard_reviews(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_note_id ON flashcards(note_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_note_id ON quiz_attempts(note_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_badge_id ON user_achievements(badge_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_note_id ON voice_notes(note_id);

-- ============================================================================
-- PART 2: Optimize RLS Policies - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- Drop and recreate policies for NOTES table
DROP POLICY IF EXISTS "Users can view own notes" ON notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Users can view own notes"
  ON notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for QUIZ_ATTEMPTS table
DROP POLICY IF EXISTS "Users can view own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can delete own quiz attempts" ON quiz_attempts;

CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own quiz attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own quiz attempts"
  ON quiz_attempts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for STUDY_SESSIONS table
DROP POLICY IF EXISTS "Users can view own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can insert own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can update own study sessions" ON study_sessions;
DROP POLICY IF EXISTS "Users can delete own study sessions" ON study_sessions;

CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for PREDICTION_RUNS table
DROP POLICY IF EXISTS "Users can view own prediction runs" ON prediction_runs;
DROP POLICY IF EXISTS "Users can insert own prediction runs" ON prediction_runs;
DROP POLICY IF EXISTS "Users can update own prediction runs" ON prediction_runs;
DROP POLICY IF EXISTS "Users can delete own prediction runs" ON prediction_runs;

CREATE POLICY "Users can view own prediction runs"
  ON prediction_runs FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own prediction runs"
  ON prediction_runs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own prediction runs"
  ON prediction_runs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own prediction runs"
  ON prediction_runs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for USER_STATS table
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for USER_ACHIEVEMENTS table
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can earn achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for FLASHCARDS table
DROP POLICY IF EXISTS "Users can manage own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can create flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete own flashcards" ON flashcards;

CREATE POLICY "Users can manage own flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for FLASHCARD_REVIEWS table
DROP POLICY IF EXISTS "Users can manage own flashcard reviews" ON flashcard_reviews;
DROP POLICY IF EXISTS "Users can create flashcard reviews" ON flashcard_reviews;
DROP POLICY IF EXISTS "Users can update own flashcard reviews" ON flashcard_reviews;

CREATE POLICY "Users can manage own flashcard reviews"
  ON flashcard_reviews FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create flashcard reviews"
  ON flashcard_reviews FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own flashcard reviews"
  ON flashcard_reviews FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for ANNOTATIONS table
DROP POLICY IF EXISTS "Users can manage own annotations" ON annotations;
DROP POLICY IF EXISTS "Users can create annotations" ON annotations;
DROP POLICY IF EXISTS "Users can update own annotations" ON annotations;
DROP POLICY IF EXISTS "Users can delete own annotations" ON annotations;

CREATE POLICY "Users can manage own annotations"
  ON annotations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create annotations"
  ON annotations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own annotations"
  ON annotations FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own annotations"
  ON annotations FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Drop and recreate policies for VOICE_NOTES table
DROP POLICY IF EXISTS "Users can manage own voice notes" ON voice_notes;
DROP POLICY IF EXISTS "Users can create voice notes" ON voice_notes;

CREATE POLICY "Users can manage own voice notes"
  ON voice_notes FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create voice notes"
  ON voice_notes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for STUDY_GROUPS table
DROP POLICY IF EXISTS "Users can view own and public groups" ON study_groups;
DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;

CREATE POLICY "Users can view own and public groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    is_public = true OR (select auth.uid()) = creator_id OR
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE group_id = study_groups.id AND user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create study groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = creator_id);

-- Drop and recreate policies for STUDY_GROUP_MEMBERS table
DROP POLICY IF EXISTS "Users can view group members" ON study_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;

CREATE POLICY "Users can view group members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id 
      AND sgm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for QUESTION_BANK table
DROP POLICY IF EXISTS "Users can view own and public questions" ON question_bank;
DROP POLICY IF EXISTS "Users can create question banks" ON question_bank;
DROP POLICY IF EXISTS "Users can update own question banks" ON question_bank;

CREATE POLICY "Users can view own and public questions"
  ON question_bank FOR SELECT
  TO authenticated
  USING (is_public = true OR (select auth.uid()) = user_id);

CREATE POLICY "Users can create question banks"
  ON question_bank FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own question banks"
  ON question_bank FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for STUDY_TIPS table
DROP POLICY IF EXISTS "Users can create study tips" ON study_tips;

CREATE POLICY "Users can create study tips"
  ON study_tips FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Drop and recreate policies for TOPIC_DIFFICULTY_STATS table
DROP POLICY IF EXISTS "Users can manage own topic stats" ON topic_difficulty_stats;
DROP POLICY IF EXISTS "Users can create topic stats" ON topic_difficulty_stats;
DROP POLICY IF EXISTS "Users can update own topic stats" ON topic_difficulty_stats;

CREATE POLICY "Users can manage own topic stats"
  ON topic_difficulty_stats FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create topic stats"
  ON topic_difficulty_stats FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own topic stats"
  ON topic_difficulty_stats FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- PART 3: Add Missing RLS Policies for CONCEPT_MAP Table
-- ============================================================================

CREATE POLICY "Users can view own concept maps"
  ON concept_map FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create concept maps"
  ON concept_map FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own concept maps"
  ON concept_map FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own concept maps"
  ON concept_map FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
