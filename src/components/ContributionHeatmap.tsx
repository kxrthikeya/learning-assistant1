import { useState, useMemo } from 'react';
import { subDays, format, startOfDay, isSameDay, getDay, startOfWeek, addDays } from 'date-fns';
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

  const { activityData, weeks, monthLabels, totalActivities } = useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 364);
    const firstDay = startOfWeek(startDate, { weekStartsOn: 0 });

    const activityMap = new Map<string, Activity>();

    for (let i = 0; i < 371; i++) {
      const date = addDays(firstDay, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const quizCount = quizAttempts.filter(a =>
        isSameDay(new Date(a.created_at), date)
      ).length;
      const uploadCount = uploads.filter(u =>
        isSameDay(new Date(u.created_at), date)
      ).length;

      activityMap.set(dateKey, {
        date,
        quizCount,
        uploadCount,
        total: quizCount + uploadCount
      });
    }

    const weeksArray: Activity[][] = [];
    const monthLabelsArray: Array<{ month: string; offset: number }> = [];
    let currentMonth = '';

    for (let week = 0; week < 53; week++) {
      const weekData: Activity[] = [];
      for (let day = 0; day < 7; day++) {
        const date = addDays(firstDay, week * 7 + day);
        const dateKey = format(date, 'yyyy-MM-dd');
        const activity = activityMap.get(dateKey) || {
          date,
          quizCount: 0,
          uploadCount: 0,
          total: 0
        };
        weekData.push(activity);

        if (day === 0) {
          const monthName = format(date, 'MMM');
          if (monthName !== currentMonth) {
            monthLabelsArray.push({ month: monthName, offset: week });
            currentMonth = monthName;
          }
        }
      }
      weeksArray.push(weekData);
    }

    const totalAct = Array.from(activityMap.values()).reduce((sum, act) => sum + act.total, 0);

    return {
      activityData: Array.from(activityMap.values()),
      weeks: weeksArray,
      monthLabels: monthLabelsArray,
      totalActivities: totalAct
    };
  }, [quizAttempts, uploads]);

  const getColorClass = (total: number) => {
    if (total === 0) return 'bg-slate-700/50 hover:bg-slate-700';
    if (total <= 2) return 'bg-green-600 hover:bg-green-500';
    if (total <= 5) return 'bg-green-500 hover:bg-green-400';
    if (total <= 7) return 'bg-green-400 hover:bg-green-300';
    return 'bg-cyan-500 hover:bg-cyan-400';
  };

  const handleMouseEnter = (activity: Activity, event: React.MouseEvent) => {
    setHoveredDay(activity);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GlassCard className="p-6 border-white/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Your Learning Activity</h2>
          <p className="text-gray-400 text-sm">
            {totalActivities} activities in the last year
            {currentStreak > 0 && <span className="text-green-400 ml-2">• {currentStreak} day streak</span>}
          </p>
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
              Keep it going!
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <div className="flex gap-1 mb-2 pl-8">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-400"
                style={{ marginLeft: idx === 0 ? 0 : `${(label.offset - (monthLabels[idx - 1]?.offset || 0)) * 12}px` }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 text-xs text-gray-500 pr-2 justify-around">
              <div className="h-3">{dayLabels[1]}</div>
              <div className="h-3"></div>
              <div className="h-3">{dayLabels[3]}</div>
              <div className="h-3"></div>
              <div className="h-3">{dayLabels[5]}</div>
              <div className="h-3"></div>
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((activity, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${getColorClass(activity.total)}`}
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
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-slate-700/50 rounded-sm" title="No activity" />
            <div className="w-3 h-3 bg-green-600 rounded-sm" title="1-2 activities" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" title="3-5 activities" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" title="6-7 activities" />
            <div className="w-3 h-3 bg-cyan-500 rounded-sm" title="8+ activities" />
          </div>
          <span>More</span>
        </div>
        <div className="text-gray-500">
          Click any day to see details
        </div>
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
