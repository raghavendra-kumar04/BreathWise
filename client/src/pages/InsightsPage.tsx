import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Award,
  CheckCircle2,
  Clock,
  TrendingDown,
  Users,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityItem {
  _id: string;
  actionType: string;
  title: string;
  description?: string;
  metrics?: {
    co2SavedKg?: number;
    particulateAvoidedUg?: number;
    exposureHoursAvoided?: number;
  };
  loggedAt: string;
}

interface InsightsSummaryData {
  stats: {
    completedProtectiveActions: number;
    totalRecommendationsReceived: number;
    adherenceRatePercent: number;
    totalCo2SavedKg: number;
    totalExposureHoursAvoided: number;
    communityReportsSubmitted: number;
  };
  recentActivities: ActivityItem[];
}

export const InsightsPage: React.FC = () => {
  const { data: summaryData, isLoading } = useQuery<InsightsSummaryData>({
    queryKey: ['insightsSummary'],
    queryFn: async () => {
      const res = await api.get('/insights/summary');
      return res.data;
    },
  });

  const stats = summaryData?.stats;
  const recentActivities = summaryData?.recentActivities || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" /> Longitudinal Health & Environmental Ledger
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">
            Personal Impact & Insights
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Tracking your daily protection checklist adherence, avoided exposure hours, and community contributions.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 rounded-3xl bg-white border border-sage/20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-forest">Aggregating historical protection insights...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Scorecard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Adherence Rate */}
            <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal/60">AI Plan Adherence</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-forest">
                  {stats?.adherenceRatePercent || 0}%
                </span>
              </div>
              <span className="text-[10px] text-charcoal/60 block">
                {stats?.completedProtectiveActions || 0} tasks completed
              </span>
            </div>

            {/* Exposure Avoided */}
            <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal/60">Severe AQI Avoided</span>
                <Clock className="w-4 h-4 text-amber-dark" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-forest">
                  {stats?.totalExposureHoursAvoided || 0}
                </span>
                <span className="text-xs text-charcoal/50">hours</span>
              </div>
              <span className="text-[10px] text-charcoal/60 block">
                Peak smog hours skipped
              </span>
            </div>

            {/* Carbon Saved */}
            <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal/60">Cumulative CO₂ Cut</span>
                <TrendingDown className="w-4 h-4 text-forest" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-forest">
                  {stats?.totalCo2SavedKg || 0}
                </span>
                <span className="text-xs text-charcoal/50">kg CO₂</span>
              </div>
              <span className="text-[10px] text-charcoal/60 block">
                Logged mobility changes
              </span>
            </div>

            {/* Community Reports */}
            <div className="p-5 rounded-3xl bg-white border border-sage/20 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-charcoal/60">Citizen Science</span>
                <Users className="w-4 h-4 text-forest" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-black text-3xl text-forest">
                  {stats?.communityReportsSubmitted || 0}
                </span>
                <span className="text-xs text-charcoal/50">reports</span>
              </div>
              <span className="text-[10px] text-charcoal/60 block">
                Hotspots flagged
              </span>
            </div>
          </div>

          {/* Action Encouragement Banner */}
          <div className="p-6 rounded-3xl bg-forest text-ivory flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-sage uppercase tracking-wider">
                Daily Routine Synchronization
              </span>
              <h3 className="font-heading font-bold text-lg">
                Consistency Beats Intensity
              </h3>
              <p className="text-xs text-ivory/80 leading-relaxed max-w-xl">
                Small repeated interventions — like running kitchen exhaust for 15 minutes after cooking and switching off high-traffic corridors — drastically reduce biological particulate accumulation.
              </p>
            </div>
            <Link
              to="/planner"
              className="px-5 py-2.5 bg-white text-forest hover:bg-ivory rounded-2xl text-xs font-bold shadow-md transition self-start sm:self-auto shrink-0"
            >
              Open Daily Planner
            </Link>
          </div>

          {/* Activity Timeline / History */}
          <div className="p-6 rounded-3xl bg-white border border-sage/20 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base text-forest">Logged Protection Milestones</h3>

            {recentActivities.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal/50 space-y-2">
                <Calendar className="w-8 h-8 text-sage mx-auto" />
                <p>Complete your daily planner tasks and explore the simulator to build your personal exposure history.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivities.map((act) => (
                  <div
                    key={act._id}
                    className="p-3.5 rounded-2xl bg-ivory/50 border border-sage/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                      <div>
                        <span className="font-bold text-forest">{act.title}</span>
                        {act.description && (
                          <p className="text-[10px] text-charcoal/60 mt-0.5">{act.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-charcoal/40 font-mono">
                      {new Date(act.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
