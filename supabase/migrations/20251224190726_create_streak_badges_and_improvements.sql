/*
  # Create Streak Badges and System Improvements

  1. Badges
    - Create 5 streak badges: 5, 10, 25, 50, 100 days
    - Create quiz completion badges
    - Create accuracy badges
    
  2. Functions
    - Auto-update user stats function
    - Auto-update leaderboard function
    - Check and award badges function
    
  3. Security
    - Additional RLS policies for data protection
    - Prevent unauthorized data access
    
  4. Performance
    - Add indexes for faster queries
*/

-- Create streak badges
INSERT INTO achievement_badges (name, description, icon_name, requirement_type, requirement_value)
VALUES 
  ('5 Day Streak', 'Study for 5 consecutive days', 'flame', 'streak', 5),
  ('10 Day Streak', 'Study for 10 consecutive days', 'flame', 'streak', 10),
  ('25 Day Warrior', 'Study for 25 consecutive days', 'flame', 'streak', 25),
  ('50 Day Champion', 'Study for 50 consecutive days', 'flame', 'streak', 50),
  ('100 Day Legend', 'Study for 100 consecutive days', 'flame', 'streak', 100),
  ('Quiz Master', 'Complete 50 quizzes', 'award', 'quizzes', 50),
  ('Quiz Expert', 'Complete 100 quizzes', 'award', 'quizzes', 100),
  ('Accuracy Pro', 'Achieve 90% accuracy', 'target', 'accuracy', 90),
  ('Perfect Score', 'Achieve 100% accuracy', 'target', 'accuracy', 100),
  ('Time Scholar', 'Study for 50 hours', 'clock', 'time', 3000)
ON CONFLICT (name) DO NOTHING;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  stats_record RECORD;
  today_date DATE;
  last_study DATE;
  new_streak INTEGER;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Get or create user stats
  SELECT * INTO stats_record
  FROM user_stats
  WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, current_streak, longest_streak, last_study_date, total_study_minutes, mastery_score)
    VALUES (NEW.user_id, 1, 1, today_date, 0, 0)
    RETURNING * INTO stats_record;
  END IF;
  
  last_study := stats_record.last_study_date;
  
  -- Update streak
  IF last_study IS NULL OR last_study < today_date - INTERVAL '1 day' THEN
    IF last_study = today_date - INTERVAL '1 day' THEN
      new_streak := stats_record.current_streak + 1;
    ELSE
      new_streak := 1;
    END IF;
    
    UPDATE user_stats
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_study_date = today_date,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on quiz completion
DROP TRIGGER IF EXISTS trigger_update_stats_on_quiz ON quiz_attempts;
CREATE TRIGGER trigger_update_stats_on_quiz
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Trigger to update stats on study session
DROP TRIGGER IF EXISTS trigger_update_stats_on_study ON study_sessions;
CREATE TRIGGER trigger_update_stats_on_study
  AFTER INSERT ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Function to calculate and update mastery score
CREATE OR REPLACE FUNCTION calculate_mastery_score(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_score NUMERIC;
  quiz_count INTEGER;
  mastery NUMERIC;
BEGIN
  SELECT 
    AVG(score)::NUMERIC,
    COUNT(*)::INTEGER
  INTO avg_score, quiz_count
  FROM quiz_attempts
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';
  
  IF quiz_count = 0 THEN
    RETURN 0;
  END IF;
  
  -- Calculate mastery: weighted average with recency bonus
  mastery := LEAST(100, avg_score * (1 + (quiz_count::NUMERIC / 100)));
  
  UPDATE user_stats
  SET mastery_score = mastery,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN mastery;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS void AS $$
BEGIN
  -- Delete old entries
  DELETE FROM leaderboard_cache;
  
  -- Insert new leaderboard data
  INSERT INTO leaderboard_cache (user_id, score, streak, rank)
  SELECT 
    us.user_id,
    (us.mastery_score * 10 + us.current_streak * 5 + us.total_study_minutes / 10)::NUMERIC as score,
    us.current_streak,
    ROW_NUMBER() OVER (ORDER BY (us.mastery_score * 10 + us.current_streak * 5 + us.total_study_minutes / 10) DESC) as rank
  FROM user_stats us;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID)
RETURNS void AS $$
DECLARE
  badge RECORD;
  stats RECORD;
  quiz_count INTEGER;
BEGIN
  -- Get user stats
  SELECT * INTO stats
  FROM user_stats
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get quiz count
  SELECT COUNT(*) INTO quiz_count
  FROM quiz_attempts
  WHERE user_id = p_user_id;
  
  -- Check each badge
  FOR badge IN SELECT * FROM achievement_badges LOOP
    -- Check if user already has this badge
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND badge_id = badge.id
    ) THEN
      -- Check if requirements are met
      IF (badge.requirement_type = 'streak' AND stats.current_streak >= badge.requirement_value) OR
         (badge.requirement_type = 'quizzes' AND quiz_count >= badge.requirement_value) OR
         (badge.requirement_type = 'accuracy' AND stats.mastery_score >= badge.requirement_value) OR
         (badge.requirement_type = 'time' AND stats.total_study_minutes >= badge.requirement_value) THEN
        -- Award badge
        INSERT INTO user_achievements (user_id, badge_id)
        VALUES (p_user_id, badge.id)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check badges after stats update
CREATE OR REPLACE FUNCTION trigger_check_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_badges_on_stats ON user_stats;
CREATE TRIGGER trigger_award_badges_on_stats
  AFTER INSERT OR UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_check_badges();

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created ON quiz_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_created ON study_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_cache(score DESC);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);

-- Additional security: Ensure RLS policies are restrictive

-- Leaderboard is public for reading but only system can write
DROP POLICY IF EXISTS "Leaderboard read access" ON leaderboard_cache;
CREATE POLICY "Leaderboard read access"
  ON leaderboard_cache FOR SELECT
  TO authenticated
  USING (true);

-- Study groups: anyone can view public groups
DROP POLICY IF EXISTS "Public groups visible to all" ON study_groups;
CREATE POLICY "Public groups visible to all"
  ON study_groups FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = auth.uid());

-- Study groups: only creator can update
DROP POLICY IF EXISTS "Creators can update groups" ON study_groups;
CREATE POLICY "Creators can update groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Study groups: only creator can delete
DROP POLICY IF EXISTS "Creators can delete groups" ON study_groups;
CREATE POLICY "Creators can delete groups"
  ON study_groups FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- Study groups: authenticated users can create
DROP POLICY IF EXISTS "Users can create groups" ON study_groups;
CREATE POLICY "Users can create groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

-- Study group members: users can join public groups
DROP POLICY IF EXISTS "Users can view group members" ON study_group_members;
CREATE POLICY "Users can view group members"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can join groups" ON study_group_members;
CREATE POLICY "Users can join groups"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM study_groups
      WHERE id = group_id AND (is_public = true OR creator_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can leave groups" ON study_group_members;
CREATE POLICY "Users can leave groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- User achievements: users can only view their own
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Achievement badges are public
DROP POLICY IF EXISTS "Badges visible to all" ON achievement_badges;
CREATE POLICY "Badges visible to all"
  ON achievement_badges FOR SELECT
  TO authenticated
  USING (true);
