/*
  # Improve Accuracy Badge System

  1. Enhanced Functions
    - Update trigger to auto-calculate mastery score after quiz attempts
    - Ensure accuracy badges (Pro, Perfect Score) are awarded when conditions met
    
  2. Logic Flow
    - When quiz is submitted: user_stats updated → mastery_score calculated → badges checked
    - Accuracy Pro: 90% mastery score
    - Perfect Score: 100% mastery score
    
  3. Data Consistency
    - Frontend and backend now both check accuracy badges
    - Backend automatically awards when conditions met
*/

-- Create wrapper function to calculate mastery and check badges
CREATE OR REPLACE FUNCTION process_quiz_completion()
RETURNS TRIGGER AS $$
DECLARE
  avg_score NUMERIC;
  quiz_count INTEGER;
  mastery NUMERIC;
BEGIN
  -- Calculate mastery score for this user
  SELECT 
    AVG(score)::NUMERIC,
    COUNT(*)::INTEGER
  INTO avg_score, quiz_count
  FROM quiz_attempts
  WHERE user_id = NEW.user_id;
  
  IF quiz_count > 0 THEN
    mastery := LEAST(100, avg_score * (1 + (quiz_count::NUMERIC / 100)));
    
    UPDATE user_stats
    SET mastery_score = mastery,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Check and award badges
  PERFORM check_and_award_badges(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new comprehensive one
DROP TRIGGER IF EXISTS trigger_calculate_mastery_on_quiz ON quiz_attempts;
CREATE TRIGGER trigger_calculate_mastery_on_quiz
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION process_quiz_completion();

-- Ensure trigger exists on study sessions too
DROP TRIGGER IF EXISTS trigger_process_study ON study_sessions;
CREATE TRIGGER trigger_process_study
  AFTER INSERT ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Run badge check for all existing users to ensure they get awarded badges
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM user_stats LOOP
    PERFORM check_and_award_badges(user_record.user_id);
  END LOOP;
END $$;
