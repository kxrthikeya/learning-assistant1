import { supabase } from './supabase';

export async function updateUserStatsAndBadges(userId: string) {
  try {
    await supabase.rpc('calculate_mastery_score', { p_user_id: userId });
    await supabase.rpc('check_and_award_badges', { p_user_id: userId });
    await supabase.rpc('update_leaderboard');
  } catch (error) {
    console.error('Failed to update user stats:', error);
  }
}

export async function initializeUserStats(userId: string) {
  try {
    const { data: existing } = await supabase
      .from('user_stats')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      await supabase.from('user_stats').insert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        total_study_minutes: 0,
        mastery_score: 0,
        weak_topics: [],
      });
    }

    const { data: leaderboardEntry } = await supabase
      .from('leaderboard_cache')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!leaderboardEntry) {
      await supabase.from('leaderboard_cache').insert({
        user_id: userId,
        score: 0,
        streak: 0,
        rank: null,
      });
    }
  } catch (error) {
    console.error('Failed to initialize user stats:', error);
  }
}

export async function updateWeakTopics(userId: string) {
  try {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('details, difficulty')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!attempts || attempts.length === 0) return;

    const topicScores: Record<string, { correct: number; total: number }> = {};

    attempts.forEach((attempt) => {
      const details = attempt.details as any[];
      if (!Array.isArray(details)) return;

      details.forEach((detail: any) => {
        const question = detail.question || '';
        const words = question.split(' ').filter((w: string) => w.length > 5);

        words.forEach((word: string) => {
          if (!topicScores[word]) {
            topicScores[word] = { correct: 0, total: 0 };
          }
          topicScores[word].total++;
          if (detail.isCorrect) {
            topicScores[word].correct++;
          }
        });
      });
    });

    const weakTopics = Object.entries(topicScores)
      .filter(([_, stats]) => stats.total >= 2)
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.correct / stats.total,
      }))
      .filter((t) => t.accuracy < 0.6)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map((t) => t.topic);

    if (weakTopics.length > 0) {
      await supabase
        .from('user_stats')
        .update({ weak_topics: weakTopics })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Failed to update weak topics:', error);
  }
}
