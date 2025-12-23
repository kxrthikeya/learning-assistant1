import { useState, useMemo } from 'react';
import { subDays, format, startOfDay, isSameDay } from 'date-fns';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

interface Activity {
  date: Date;
  quizCount: number;
  uploadCount: number;
  total: number;
}

interface ContributionHeatmapProps {
  quizAttempts: Array<{ created_at: string }>;
  uploads: Array<{ created_at: string }>;
  currentStreak: number;
}

export function ContributionHeatmap({ quizAttempts, uploads, currentStreak }: ContributionHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<Activity | null>(null);
  const [selectedDay, setSelectedDay] = useState<Activity | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const activityData = useMemo(() => {
    const days: Activity[] = [];
    const today = startOfDay(new Date());

    for (let i = 97; i >= 0; i--) {
      const date = subDays(today, i);
      const quizCount = quizAttempts.filter(a =>
        isSameDay(new Date(a.created_at), date)
      ).length;
      const uploadCount = uploads.filter(u =>
        isSameDay(new Date(u.created_at), date)
      ).length;

      days.push({
        date,
        quizCount,
        uploadCount,
        total: quizCount + uploadCount
      });
    }

    return days;
  }, [quizAttempts, uploads]);

  const getColorClass = (total: number) => {
    if (total === 0) return 'bg-slate-700/50 hover:bg-slate-700';
    if (total <= 2) return 'bg-green-600 hover:bg-green-500';
    if (total <= 5) return 'bg-green-500 hover:bg-green-400';
    if (total <= 7) return 'bg-green-400 hover:bg-green-300';
    return 'bg-cyan-500 hover:bg-cyan-400';
  };

  const weeks = useMemo(() => {
    const weeksArray: Activity[][] = [];
    for (let i = 0; i < 14; i++) {
      weeksArray.push(activityData.slice(i * 7, (i + 1) * 7));
    }
    return weeksArray;
  }, [activityData]);

  const handleMouseEnter = (activity: Activity, event: React.MouseEvent) => {
    setHoveredDay(activity);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <GlassCard className="p-6 border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Your Learning Activity</h2>
          <p className="text-gray-400 text-sm">Track your daily progress over the past 14 weeks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-xs text-gray-400">Current Streak</p>
              <p className="text-xl font-bold text-orange-400">{currentStreak} days</p>
            </div>
          </div>
          {currentStreak > 0 && (
            <p className="text-sm text-green-400 font-medium hidden lg:block">
              Keep the streak alive!
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((activity, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-4 h-4 rounded-sm transition-all duration-200 cursor-pointer ${getColorClass(activity.total)}`}
                  onMouseEnter={(e) => handleMouseEnter(activity, e)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(activity)}
                  title={`${format(activity.date, 'MMM d, yyyy')}: ${activity.total} activities`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-4 pt-4 border-t border-white/5">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-slate-700/50 rounded-sm" title="No activity" />
          <div className="w-4 h-4 bg-green-600 rounded-sm" title="1-2 activities" />
          <div className="w-4 h-4 bg-green-500 rounded-sm" title="3-5 activities" />
          <div className="w-4 h-4 bg-green-400 rounded-sm" title="6-7 activities" />
          <div className="w-4 h-4 bg-cyan-500 rounded-sm" title="8+ activities (Perfect!)" />
        </div>
        <span>More</span>
      </div>

      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <div className="bg-slate-900 border border-white/20 rounded-lg p-3 shadow-2xl text-sm">
            <p className="font-semibold text-white mb-1">
              {format(hoveredDay.date, 'MMM d, yyyy')}
            </p>
            <p className="text-gray-300">
              {hoveredDay.total === 0 ? 'No activity' : `${hoveredDay.total} activities`}
            </p>
            {hoveredDay.total > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                {hoveredDay.quizCount > 0 && <div>{hoveredDay.quizCount} quiz{hoveredDay.quizCount !== 1 ? 'zes' : ''}</div>}
                {hoveredDay.uploadCount > 0 && <div>{hoveredDay.uploadCount} upload{hoveredDay.uploadCount !== 1 ? 's' : ''}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <GlassCard className="max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedDay.total === 0 ? 'No activities recorded' : `${selectedDay.total} total activities`}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDay.total > 0 ? (
              <div className="space-y-4">
                {selectedDay.quizCount > 0 && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📝</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Quiz Attempts</p>
                        <p className="text-xs text-gray-400">{selectedDay.quizCount} completed</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDay.uploadCount > 0 && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📄</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Notes Uploaded</p>
                        <p className="text-xs text-gray-400">{selectedDay.uploadCount} added</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-3">😴</div>
                <p className="text-gray-400">No study activities on this day</p>
                <p className="text-sm text-gray-500 mt-2">That's okay! Rest is important too.</p>
              </div>
            )}

            <Button
              onClick={() => setSelectedDay(null)}
              className="w-full mt-6"
            >
              Close
            </Button>
          </GlassCard>
        </div>
      )}
    </GlassCard>
  );
}
