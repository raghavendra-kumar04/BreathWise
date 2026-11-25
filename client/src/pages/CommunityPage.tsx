import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Users,
  Flame,
  ThumbsUp,
  MapPin,
  PlusCircle,
  Clock,
  Filter,
  X,
} from 'lucide-react';

interface CommunityReportItem {
  _id: string;
  userName: string;
  title: string;
  description: string;
  category: 'smoke' | 'dust' | 'garbage-burning' | 'industrial' | 'traffic-jam' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'hazardous';
  location: {
    city: string;
    neighborhood?: string;
    latitude: number;
    longitude: number;
  };
  upvotes: number;
  createdAt: string;
}

interface NewReportPayload {
  title: string;
  description: string;
  category: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  severity: string;
}

export const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Submission Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('garbage-burning');
  const [neighborhood, setNeighborhood] = useState('');
  const [severity] = useState('high');
  const [formError, setFormError] = useState('');

  const city = user?.location?.city ?? 'New Delhi';

  // 1. Fetch Approved Community Reports
  const { data: reportsData, isLoading } = useQuery<CommunityReportItem[]>({
    queryKey: ['communityReports', city, selectedCategory],
    queryFn: async () => {
      let url = `/community/reports?city=${encodeURIComponent(city)}`;
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      const res = await api.get(url);
      return res.data?.reports || [];
    },
  });

  // 2. Submit Report Mutation
  const createReportMutation = useMutation({
    mutationFn: async (payload: NewReportPayload) => {
      const res = await api.post('/community/reports', payload);
      return res.data?.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityReports'] });
      setIsSubmitModalOpen(false);
      setTitle('');
      setDescription('');
      setNeighborhood('');
    },
    onError: (err: unknown) => {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to submit community observation.';
      setFormError(errorMsg);
    },
  });

  // 3. Upvote Mutation
  const upvoteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await api.post(`/community/reports/${reportId}/upvote`);
      return res.data?.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityReports'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Please provide a title and incident description.');
      return;
    }

    createReportMutation.mutate({
      title,
      description,
      category,
      severity,
      city,
      neighborhood: neighborhood.trim() || city,
      latitude: user?.location?.latitude || 28.6139,
      longitude: user?.location?.longitude || 77.2090,
    });
  };

  const categories = [
    { id: 'all', label: 'All Observations' },
    { id: 'garbage-burning', label: 'Garbage Burning' },
    { id: 'dust', label: 'Construction Dust' },
    { id: 'smoke', label: 'Dense Smoke' },
    { id: 'traffic-jam', label: 'Traffic Bottleneck' },
    { id: 'industrial', label: 'Industrial Emission' },
  ];

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'garbage-burning':
        return { label: 'Garbage Burning', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'dust':
        return { label: 'Construction Dust', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'smoke':
        return { label: 'Dense Smoke', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' };
      case 'traffic-jam':
        return { label: 'Traffic Smog', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      default:
        return { label: 'Observation', color: 'bg-sage/20 text-forest border-sage/30' };
    }
  };

  const reports = reportsData || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sage/20 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" /> Crowdsourced Neighborhood Awareness
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-forest">
            Community Intelligence
          </h1>
          <p className="text-xs text-charcoal/70 mt-1">
            Official CPCB stations only capture regional averages. Report local biomass fires, construction dust clouds, and localized hotspots in <strong className="text-forest">{city}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-ivory text-xs font-semibold shadow-md transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Hotspot</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-charcoal/40 shrink-0 ml-1" />
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === c.id
                ? 'bg-forest text-ivory shadow-xs'
                : 'bg-white text-charcoal/70 hover:bg-ivory border border-sage/25'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {isLoading ? (
        <div className="p-16 rounded-3xl bg-white border border-sage/20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-forest">Loading neighborhood ground observations...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-sage/20 shadow-sm text-center max-w-lg mx-auto space-y-3">
          <Users className="w-10 h-10 text-sage mx-auto" />
          <h3 className="font-heading font-bold text-lg text-forest">No Ground Incidents Reported in {city}</h3>
          <p className="text-xs text-charcoal/60 leading-relaxed">
            Be the first citizen scientist to report localized smoke, unpaved construction dust, or garbage burning in your neighborhood.
          </p>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-forest text-ivory text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Observation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const badge = getCategoryBadge(r.category);
            return (
              <div
                key={r._id}
                className="p-5 rounded-2xl bg-white border border-sage/20 shadow-xs hover:border-forest/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-charcoal/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-base text-forest">{r.title}</h4>
                    <p className="text-xs text-charcoal/80 leading-relaxed mt-1">{r.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-sage/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-charcoal/60 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span className="truncate font-medium">{r.location?.neighborhood || r.location?.city}</span>
                  </div>

                  <button
                    onClick={() => upvoteMutation.mutate(r._id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ivory hover:bg-forest/10 border border-sage/30 text-forest text-xs font-semibold transition cursor-pointer"
                    title="Confirm / Upvote Incident"
                    aria-label={`Upvote report ${r.title}, currently ${r.upvotes || 1} upvotes`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{r.upvotes || 1}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sage/30 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-sage/20">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-dark" />
                <h3 id="report-modal-title" className="font-heading font-bold text-lg text-forest">Report Pollution Hotspot</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-charcoal/40 hover:text-charcoal p-1 rounded-lg"
                aria-label="Close report modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                >
                  <option value="garbage-burning">Local Garbage / Leaf Burning</option>
                  <option value="dust">Construction / Unpaved Road Dust</option>
                  <option value="smoke">Dense Visible Smoke Plume</option>
                  <option value="traffic-jam">Severe Traffic Gridlock Smog</option>
                  <option value="industrial">Unregulated Industrial Fumes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Headline / Short Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open plastic burning behind residential colony"
                  className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Neighborhood / Landmark in {city}
                </label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Sector 14 market / Outer Ring Road flyover"
                  className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Detailed Observation
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe smell, visibility, duration, and whether smoke is entering nearby flats..."
                  className="w-full p-2.5 bg-ivory rounded-xl border border-sage/30 text-xs focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-charcoal/70 hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createReportMutation.isPending}
                  className="px-5 py-2.5 bg-forest hover:bg-forest-light text-ivory text-xs font-semibold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {createReportMutation.isPending ? 'Publishing...' : 'Publish Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
