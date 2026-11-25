import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bike,
  Wind,
  Home,
  Utensils,
  RefreshCw,
  Info,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const lat = user?.location?.latitude ?? 28.6139;
  const lon = user?.location?.longitude ?? 77.2090;
  const city = user?.location?.city ?? 'New Delhi';

  // 1. Fetch Today's Plan
  const { data: planData, isLoading } = useQuery({
    queryKey: ['dailyPlanToday'],
    queryFn: async () => {
      const res = await api.get('/planner/today');
      return res.data?.plan;
    },
  });

  // 2. Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/planner/generate', { lat, lon, city });
      return res.data?.plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlanToday'] });
    },
  });

  // 3. Toggle Task Completion Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const res = await api.patch(`/planner/tasks/${taskId}`, { completed });
      return res.data?.plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlanToday'] });
    },
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'exercise':
        return Bike;
      case 'commute':
        return Wind;
      case 'indoor':
        return Home;
      case 'ventilation':
        return Clock;
      case 'diet':
        return Utensils;
      default:
        return ShieldCheck;
    }
  };

  const plan = planData;
  const completedCount = plan?.recommendations?.filter((r: any) => r.completed)?.length || 0;
  const totalCount = plan?.recommendations?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/15 text-amber-dark text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini 2.5 Flash
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">
            Personalized Daily Action Plan
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Tailored exposure reduction for <strong className="text-forest">{city}</strong> based on live telemetry & your lifestyle.
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-md transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{generateMutation.isPending ? 'Generating with Gemini...' : plan ? 'Regenerate Plan' : 'Generate Today\'s Plan'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 rounded-3xl bg-white border border-sage/20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-forest">Loading your personalized daily blueprint...</p>
        </div>
      ) : !plan ? (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white border border-sage/20 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 text-forest mx-auto flex items-center justify-center">
            <Calendar className="w-8 h-8 text-forest" />
          </div>
          <h2 className="font-heading font-extrabold text-xl text-forest">
            No Action Plan Generated for Today Yet
          </h2>
          <p className="text-xs text-charcoal/70 leading-relaxed max-w-md mx-auto">
            BreatheWise uses Gemini AI to analyze today's CPCB station metrics, your commute preferences, and local wind conditions to create customized hourly actions.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-6 py-3 bg-forest hover:bg-forest-light text-ivory rounded-xl text-xs font-semibold shadow-lg transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Today's Action Plan</span>
          </button>
        </div>
      ) : (
        /* Active Plan View */
        <div className="space-y-6">
          {/* Briefing Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sage-dark">
                Morning Environmental Briefing
              </span>
              <span className="text-xs text-charcoal/60">
                Ground Telemetry: AQI {plan.sourceSnapshot?.aqi} ({plan.sourceSnapshot?.category}) • {plan.sourceSnapshot?.source}
              </span>
            </div>

            <p className="text-base sm:text-lg text-charcoal font-medium leading-relaxed">
              "{plan.dailySummary}"
            </p>

            {/* Checklist Progress Bar */}
            <div className="pt-4 border-t border-sage/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-forest">Daily Protection Checklist</span>
                <span className="text-charcoal/70">{completedCount} of {totalCount} completed ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2.5 bg-ivory rounded-full overflow-hidden border border-sage/20">
                <div
                  className="h-full bg-forest transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Tasks Grid */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-forest">Recommended Actions for Today</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.recommendations.map((rec: any, idx: number) => {
                const Icon = getCategoryIcon(rec.category);
                const isDone = rec.completed;

                return (
                  <div
                    key={rec._id || idx}
                    className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between ${
                      isDone
                        ? 'bg-ivory/50 border-sage/30 opacity-70'
                        : 'bg-white border-sage/20 hover:border-forest/30'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-sage/20 text-forest' : 'bg-forest/10 text-forest'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sage-dark block">
                              {rec.category} {rec.suggestedTime ? `• ${rec.suggestedTime}` : ''}
                            </span>
                            <h4 className={`font-heading font-bold text-sm ${isDone ? 'line-through text-charcoal/60' : 'text-forest'}`}>
                              {rec.title}
                            </h4>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          rec.priority === 'high'
                            ? 'bg-amber/20 text-amber-dark'
                            : 'bg-sage/20 text-forest'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>

                      {/* Reason & Action */}
                      <p className="text-xs text-charcoal/80 font-normal leading-relaxed">
                        {rec.action}
                      </p>

                      <div className="p-2.5 rounded-xl bg-ivory/70 border border-sage/20 text-[11px] text-charcoal/70">
                        <strong className="text-forest">Why:</strong> {rec.reason}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-sage/20 flex items-center justify-between">
                      <span className="text-[10px] text-forest font-semibold truncate max-w-[200px]">
                        Impact: {rec.estimatedImpact}
                      </span>
                      <button
                        onClick={() => toggleTaskMutation.mutate({ taskId: rec._id, completed: !isDone })}
                        className={`text-xs font-semibold px-3 py-1 rounded-xl transition flex items-center gap-1.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-forest/10 hover:bg-forest/20 text-forest'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Transparency & Provenance Disclaimer */}
          <div className="p-4 rounded-2xl bg-white border border-sage/20 text-xs text-charcoal/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-forest">
              <Info className="w-4 h-4 text-forest" />
              <span>Data Provenance & Scientific Boundaries</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              {plan.limitations?.map((lim: string, idx: number) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
