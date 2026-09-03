import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types/finance';
import { PrivacyValue } from '../common/PrivacyValue';
import confetti from 'canvas-confetti';
import {
  Target,
  Plus,
  Flame,
  ShieldCheck,
  GraduationCap,
  Home,
  Plane,
  Car,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface GoalListProps {
  onOpenAddGoal: (goalToEdit?: Goal) => void;
}

export const GoalList: React.FC<GoalListProps> = ({ onOpenAddGoal }) => {
  const { profileGoals, deleteGoal } = useFinance();

  const getGoalIcon = (category: string) => {
    switch (category) {
      case 'FIRE': return Flame;
      case 'Emergency': return ShieldCheck;
      case 'Education': return GraduationCap;
      case 'Home': return Home;
      case 'Travel': return Plane;
      case 'Vehicle': return Car;
      default: return Target;
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-950/10 via-white to-gray-50 dark:from-[#180f1e] dark:via-[#141a17] dark:to-[#0f1412] border border-gray-200/80 dark:border-gray-800/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-purple-900/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
              Financial Goals & FIRE Planner
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Plan life milestones with automated inflation indexing, required SIP roadmaps, and timeline forecasts
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAddGoal()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all shadow-sm active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {profileGoals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-[#141a17]/50">
          <Target className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            No financial goals set yet
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Define your targets for early retirement (FIRE), emergency fund, dream house, or child's higher education.
          </p>
          <button
            onClick={() => onOpenAddGoal()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {profileGoals.map(goal => {
            const Icon = getGoalIcon(goal.category);
            const currentYear = new Date().getFullYear();
            const yearsRemaining = Math.max(1, goal.targetYear - currentYear);

            // Future Inflation-Adjusted Target
            const inflationMultiplier = Math.pow(1 + goal.expectedInflationRate / 100, yearsRemaining);
            const futureAdjustedTarget = goal.targetAmount * inflationMultiplier;

            // Progress percentage
            const progressPct = futureAdjustedTarget > 0
              ? Math.min(100, Math.max(0, (goal.currentAmount / futureAdjustedTarget) * 100))
              : 0;

            const isAchieved = progressPct >= 100;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#141a17] border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 font-mono">
                          {goal.category}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {goal.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenAddGoal(goal)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg cursor-pointer"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stat Columns */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-gray-800/80">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">Current Saved</span>
                      <div className="font-display font-bold text-base text-gray-900 dark:text-white mt-0.5">
                        <PrivacyValue amountInINR={goal.currentAmount} />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">
                        Target in {goal.targetYear} ({goal.expectedInflationRate}% Inf.)
                      </span>
                      <div className="font-display font-bold text-base text-purple-600 dark:text-purple-400 mt-0.5">
                        <PrivacyValue amountInINR={futureAdjustedTarget} />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">
                        {progressPct.toFixed(1)}% Achieved
                      </span>
                      <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {yearsRemaining} yrs left ({goal.targetYear})
                      </span>
                    </div>

                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(3, progressPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Roadmap */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
                  <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                    Monthly SIP: <span className="font-bold text-gray-900 dark:text-white"><PrivacyValue amountInINR={goal.monthlyContribution} compact={true} /></span>
                  </div>

                  {isAchieved ? (
                    <button
                      onClick={triggerConfetti}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Goal Reached! 🎉
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-full font-mono">
                      🚀 On Track ({goal.expectedReturnRate}% CAGR)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
