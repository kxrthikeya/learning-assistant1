import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { GlassCard } from '../components/GlassCard';
import { analyzeUserWeaknesses } from '../lib/weakness-detector';
import { AlertCircle, TrendingDown, BookOpen, Zap } from 'lucide-react';

interface WeakTopic {
  topic: string;
  accuracy: number;
  totalAttempts: number;
  correctCount: number;
}

export function WeaknessPage() {
  const { user } = useAuthStore();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [recommendedFocus, setRecommendedFocus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      analyzeWeaknesses();
    }
  }, [user]);

  const analyzeWeaknesses = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeUserWeaknesses(user!.id);
      setWeakTopics(analysis.weakTopics);
      setOverallAccuracy(analysis.overallAccuracy);
      setRecommendedFocus(analysis.recommendedFocus);
    } catch (error) {
      console.error('Failed to analyze weaknesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-400';
    if (accuracy >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500/10 border-green-500/30';
    if (accuracy >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Weakness Analysis</h1>
        <p className="text-gray-400">Identify areas that need improvement</p>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {Math.round(overallAccuracy)}%
            </div>
            <p className="text-gray-400">Overall Accuracy</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {weakTopics.length}
            </div>
            <p className="text-gray-400">Topics Analyzed</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">
              {recommendedFocus.length}
            </div>
            <p className="text-gray-400">Focus Areas</p>
          </div>
        </div>
      </GlassCard>

      {recommendedFocus.length > 0 && (
        <GlassCard className="border-l-4 border-amber-500 bg-amber-500/5">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Recommended Focus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recommendedFocus.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className="text-left px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                  >
                    <Zap className="w-4 h-4 inline mr-2" />
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Topic Performance</h2>
        <div className="grid gap-4">
          {weakTopics.length === 0 ? (
            <GlassCard className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-50" />
              <p className="text-gray-400">
                Complete more quizzes to see weakness analysis
              </p>
            </GlassCard>
          ) : (
            weakTopics.map((topic) => (
              <GlassCard
                key={topic.topic}
                className={`p-5 border cursor-pointer hover:border-cyan-400/50 transition-all ${getAccuracyBg(
                  topic.accuracy
                )}`}
                onClick={() => setSelectedTopic(topic.topic)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {topic.topic}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {topic.correctCount} correct out of {topic.totalAttempts}{' '}
                      attempts
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${getAccuracyColor(topic.accuracy)}`}>
                    {Math.round(topic.accuracy)}%
                  </div>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      topic.accuracy >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : topic.accuracy >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    style={{ width: `${topic.accuracy}%` }}
                  />
                </div>

                {topic.accuracy < 70 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-amber-300">
                    <TrendingDown className="w-4 h-4" />
                    Needs improvement
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {selectedTopic && (
        <GlassCard className="border-l-4 border-blue-500 bg-blue-500/5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recommended Practice: {selectedTopic}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Review Materials</p>
                <p className="text-sm text-gray-400">
                  Review your notes on {selectedTopic}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
              <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Practice Quiz</p>
                <p className="text-sm text-gray-400">
                  Take a focused quiz on {selectedTopic}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
              <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Flashcard Review</p>
                <p className="text-sm text-gray-400">
                  Review flashcards related to {selectedTopic}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
