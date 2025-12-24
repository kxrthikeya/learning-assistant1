/*
  # Fix Security and Performance Issues

  1. RLS Performance Optimization
    - Update policies to use (select auth.uid()) instead of auth.uid() for better query performance
    - Affects: study_groups, study_group_members, user_achievements tables
  
  2. Duplicate Policy Cleanup
    - Remove duplicate permissive policies for SELECT/INSERT operations
    - achievement_badges: Remove "Badges visible to all" (keep "Badges are publicly readable")
    - leaderboard_cache: Remove "Leaderboard read access" (keep "Leaderboard is publicly readable")
    - study_groups: Remove "Users can create study groups" (keep "Users can create groups")
    - study_groups: Remove "Users can view own and public groups" (keep "Public groups visible to all")
  
  3. Duplicate Index Cleanup
    - Remove duplicate indexes keeping the newer ones
    - leaderboard_cache: Drop idx_leaderboard_score
    - study_group_members: Drop idx_study_group_members_user_id
    - user_achievements: Drop idx_user_achievements_user_id
  
  4. Remove Unused Indexes
    - Drop indexes not actively used by queries for performance and storage optimization
*/

-- Drop duplicate policies

-- Drop duplicate SELECT policies on achievement_badges
DROP POLICY IF EXISTS "Badges visible to all" ON achievement_badges;

-- Drop duplicate SELECT policies on leaderboard_cache
DROP POLICY IF EXISTS "Leaderboard read access" ON leaderboard_cache;

-- Drop duplicate INSERT policies on study_groups
DROP POLICY IF EXISTS "Users can create study groups" ON study_groups;

-- Drop duplicate SELECT policies on study_groups
DROP POLICY IF EXISTS "Users can view own and public groups" ON study_groups;

-- Fix RLS policies by replacing auth.uid() with (select auth.uid()) for performance

-- Drop and recreate study_groups policies
DROP POLICY IF EXISTS "Public groups visible to all" ON study_groups;
CREATE POLICY "Public groups visible to all"
  ON study_groups FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create groups" ON study_groups;
CREATE POLICY "Users can create groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can update groups" ON study_groups;
CREATE POLICY "Creators can update groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Creators can delete groups" ON study_groups;
CREATE POLICY "Creators can delete groups"
  ON study_groups FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- Fix study_group_members policies
DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;
CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can leave groups" ON study_group_members;
CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix user_achievements policy
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop duplicate indexes

DROP INDEX IF EXISTS idx_leaderboard_score;
DROP INDEX IF EXISTS idx_study_group_members_user_id;
DROP INDEX IF EXISTS idx_user_achievements_user_id;

-- Drop unused indexes for performance optimization

DROP INDEX IF EXISTS idx_flashcard_reviews_next_date;
DROP INDEX IF EXISTS idx_annotations_user_id;
DROP INDEX IF EXISTS idx_annotations_note_id;
DROP INDEX IF EXISTS idx_voice_notes_user_id;
DROP INDEX IF EXISTS idx_study_groups_creator_id;
DROP INDEX IF EXISTS idx_notes_created_at;
DROP INDEX IF EXISTS idx_quiz_attempts_created_at;
DROP INDEX IF EXISTS idx_study_sessions_created_at;
DROP INDEX IF EXISTS idx_prediction_runs_user_id;
DROP INDEX IF EXISTS idx_question_bank_user_id;
DROP INDEX IF EXISTS idx_study_tips_user_id;
DROP INDEX IF EXISTS idx_topic_stats_user_id;
DROP INDEX IF EXISTS idx_flashcards_note_id;
DROP INDEX IF EXISTS idx_quiz_attempts_note_id;
DROP INDEX IF EXISTS idx_user_achievements_badge_id;
DROP INDEX IF EXISTS idx_voice_notes_note_id;
DROP INDEX IF EXISTS idx_quiz_attempts_user_created;
DROP INDEX IF EXISTS idx_study_group_members_group;
