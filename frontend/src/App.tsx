import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import { api } from './lib/axios';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { 
  TrendingUp, 
  DollarSign, 
  MousePointer, 
  Eye, 
  Percent, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  Shield, 
  Activity,
  Layers,
  ChevronRight,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from 'recharts';

// --- MAIN WRAPPER COMPONENT ---
export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

// --- DYNAMIC DASHBOARD COMPONENT ---
function App() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Campaign Modals / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  
  // Form input states
  const [campName, setCampName] = useState('');
  const [campBudget, setCampBudget] = useState('');
  const [campStatus, setCampStatus] = useState('DRAFT');
  const [campStart, setCampStart] = useState('');
  const [campEnd, setCampEnd] = useState('');

  // --- API QUERIES ---
  
  // Fetch Dashboard Analytics Totals
  const { data: analyticsData, refetch: refetchAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data.data;
    },
    enabled: isAuthenticated
  });

  // Fetch All Campaigns
  const { data: campaignsResponse, refetch: refetchCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get('/campaigns');
      return response.data.data;
    },
    enabled: isAuthenticated
  });

  // Fetch campaign detail helper for AI Insights
  const { data: campaignDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['campaignDetails', campaignsResponse],
    queryFn: async () => {
      if (!campaignsResponse || campaignsResponse.length === 0) return [];
      const details = await Promise.all(
        campaignsResponse.slice(0, 5).map(async (c: any) => {
          try {
            const res = await api.get(`/campaigns/${c.id}`);
            return res.data.data;
          } catch (e) {
            return null;
          }
        })
      );
      return details.filter(Boolean);
    },
    enabled: isAuthenticated && !!campaignsResponse && campaignsResponse.length > 0
  });

  // --- API MUTATIONS ---
  
  // Create Campaign Mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (newCampaign: any) => {
      const response = await api.post('/campaigns', newCampaign);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      setShowAddModal(false);
      resetCampForm();
    }
  });

  // Update Campaign Mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/campaigns/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      setEditingCampaign(null);
      resetCampForm();
    }
  });

  // Delete Campaign Mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/campaigns/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
    }
  });

  // --- ACTIONS ---
  
  // Login Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response.data.user, response.data.token);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Up Action
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      setAuth(response.data.user, response.data.token);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Sign up failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Demo Logins (Great for interview presentations!)
  const triggerDemoLogin = async (role: 'advertiser' | 'admin') => {
    setAuthError('');
    setAuthLoading(true);
    const demoEmail = role === 'advertiser' ? 'advertiser@example.com' : 'admin@example.com';
    const demoPassword = role === 'advertiser' ? 'user123' : 'admin123';
    try {
      const response = await api.post('/auth/login', { email: demoEmail, password: demoPassword });
      setAuth(response.data.user, response.data.token);
    } catch (err: any) {
      setAuthError('Demo data not seeded yet. Run backend seeder first.');
    } finally {
      setAuthLoading(false);
    }
  };

  const resetCampForm = () => {
    setCampName('');
    setCampBudget('');
    setCampStatus('DRAFT');
    setCampStart('');
    setCampEnd('');
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaignMutation.mutate({
      name: campName,
      budget: parseFloat(campBudget),
      status: campStatus,
      startDate: campStart,
      endDate: campEnd || null
    });
  };

  const handleUpdateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    updateCampaignMutation.mutate({
      id: editingCampaign.id,
      data: {
        name: campName,
        budget: parseFloat(campBudget),
        status: campStatus,
        startDate: campStart,
        endDate: campEnd || null
      }
    });
  };

  const startEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setCampName(campaign.name);
    setCampBudget(campaign.budget.toString());
    setCampStatus(campaign.status);
    setCampStart(new Date(campaign.startDate).toISOString().split('T')[0]);
    setCampEnd(campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '');
  };

  // Aggregate stats from campaignsResponse to handle missing metric aggregates dynamically
  const campaignsList = campaignsResponse || [];
  
  // Calculate total budget dynamically
  const totalBudget = campaignsList.reduce((acc: number, c: any) => acc + c.budget, 0);

  // Extract Recharts Data
  const chartData = campaignsList
    .filter((c: any) => c.metrics && c.metrics.impressions > 0)
    .map((c: any) => ({
      name: c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name,
      spend: c.metrics.spend,
      revenue: c.metrics.revenue,
      clicks: c.metrics.clicks,
      conversions: c.metrics.conversions,
      impressions: c.metrics.impressions,
    }));

  // Aggregate all AI Insights
  const allAIInsights = campaignDetails
    ? campaignDetails.flatMap((c: any) => c.aiInsights.map((insight: any) => ({
        ...insight,
        campaignName: c.name
      })))
    : [];

  // --- RENDER AUTHENTICATION PANEL ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-100">
        {/* Soft Background Radial Light */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

        {/* Outer Frame */}
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              AdVision Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure & scale high-performance campaigns</p>
          </div>

          {/* Login/Signup Tabs */}
          <div className="flex rounded-lg bg-slate-950/80 p-1 border border-slate-800 mb-6">
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authTab === 'login' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab('signup'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authTab === 'signup' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={authTab === 'login' ? handleLogin : handleSignUp} className="space-y-4">
            {authTab === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="advertiser@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-2 rounded-lg text-sm shadow-lg shadow-blue-500/10 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? 'Verifying Session...' : authTab === 'login' ? 'Access Dashboard' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Login Triggers (Developer Bypass Mode) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-center text-xs font-medium text-slate-500 mb-3.5">Developer / Interviewer Direct Login</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerDemoLogin('advertiser')}
                className="flex items-center justify-center gap-1.5 py-2 border border-slate-800 hover:bg-slate-800/40 text-slate-300 font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                Advertiser Role
              </button>
              <button
                type="button"
                onClick={() => triggerDemoLogin('admin')}
                className="flex items-center justify-center gap-1.5 py-2 border border-slate-800 hover:bg-slate-800/40 text-slate-300 font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-violet-400" />
                Admin Role
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER COMPLETE CORE DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP HEADER & BRANDING */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
              AdVision Insights
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full tracking-wider">
                Active Client State
              </span>
            </h1>
          </div>
        </div>

        {/* User Card & Control actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-full pl-3 pr-4 py-1.5">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center">
              <UserIcon className="h-3 w-3 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
              <p className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider font-bold">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-lg text-slate-400 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">

        {/* 2. DYNAMIC ANALYTICS SUMMARY KPI GRID */}
        {isLoadingAnalytics ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-900/40 border border-slate-800/80 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : analyticsData ? (
          <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Campaigns count */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700/60 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[10px]">Total Campaigns</span>
                <Layers className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold font-sans tracking-tight">{analyticsData.totalCampaigns}</p>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                Active & Draft
              </p>
            </div>

            {/* Total Budget */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700/60 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[10px]">Allocated Budget</span>
                <DollarSign className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-sans tracking-tight">
                ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Combined portfolio limit</p>
            </div>

            {/* Total Spend */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700/60 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[10px]">Total Spend</span>
                <DollarSign className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold font-sans tracking-tight">
                ${parseFloat(analyticsData.totalSpend).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Real-time expenditure</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-slate-700/60 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[10px]">Total Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-sans tracking-tight">
                ${parseFloat(analyticsData.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Direct conversion sales</p>
            </div>

            {/* ROAS (Aggregated Metric) */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 shadow-sm hover:border-indigo-700/60 transition group relative overflow-hidden col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider text-[10px]">Portfolio ROAS</span>
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold font-sans tracking-tight text-indigo-300">
                {analyticsData.roas}x
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Return on Ad Spend ratio</p>
            </div>

            {/* Sub-KPI Ratios bar */}
            <div className="col-span-2 lg:col-span-5 grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div className="bg-slate-900/10 border border-slate-800/40 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-blue-400" /> Impressions</span>
                <span className="font-bold">{analyticsData.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/10 border border-slate-800/40 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><MousePointer className="h-3.5 w-3.5 text-amber-400" /> Clicks</span>
                <span className="font-bold">{analyticsData.totalClicks.toLocaleString()} (CTR: {analyticsData.ctr}%)</span>
              </div>
              <div className="bg-slate-900/10 border border-slate-800/40 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><Percent className="h-3.5 w-3.5 text-emerald-400" /> Conversions</span>
                <span className="font-bold">{analyticsData.totalConversions} (CVR: {analyticsData.conversionRate}%)</span>
              </div>
              <div className="bg-slate-900/10 border border-slate-800/40 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-red-400" /> Avg CPC</span>
                <span className="font-bold">${analyticsData.cpc}</span>
              </div>
            </div>
          </section>
        ) : null}

        {/* 3. INTERACTIVE RECHARTS VISUALIZATION GRID */}
        {chartData.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Performance chart */}
            <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Campaign Budget efficiency (Spend vs Revenue)
              </h3>
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                    <Line type="monotone" dataKey="spend" name="Spend ($)" stroke="#f43f5e" strokeWidth={2} />
                    <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance conversions chart */}
            <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Audience conversion metrics (Clicks vs Conversions)
              </h3>
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Legend />
                    <Bar dataKey="clicks" name="Clicks" fill="#f59e0b" />
                    <Bar dataKey="conversions" name="Conversions" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* 4. CAMPAIGN MANAGER TABLE GRID & CRUD CAPABILITIES */}
        <section className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-100">Campaign Portfolio</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage statuses, allocate marketing budgets, and execute CRUD updates</p>
            </div>
            
            <button
              onClick={() => { resetCampForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs shadow transition cursor-pointer self-start"
            >
              <Plus className="h-4 w-4" />
              Launch Campaign
            </button>
          </div>

          {isLoadingCampaigns ? (
            <div className="h-48 flex justify-center items-center">
              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : campaignsList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
              <Layers className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">No campaigns launched</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Create a campaign or run the mock data seeder script on the backend terminal to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Allocated Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">ROAS Ratio</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {campaignsList.map((c: any) => {
                    const statusColors: any = {
                      ACTIVE: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                      PAUSED: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                      DRAFT: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
                      COMPLETED: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                    };

                    const roasVal = c.metrics && c.metrics.spend > 0 
                      ? (c.metrics.revenue / c.metrics.spend).toFixed(2) 
                      : '0.00';

                    return (
                      <tr key={c.id} className="hover:bg-slate-900/10 transition group">
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{c.name}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                          ${c.budget.toLocaleString('en-US')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-full ${statusColors[c.status] || 'bg-slate-800'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          <span>{new Date(c.startDate).toLocaleDateString()}</span>
                          {c.endDate && (
                            <>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                              <span>{new Date(c.endDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </td>
                        <td className={`py-3.5 px-4 font-mono font-bold ${parseFloat(roasVal) >= 1.5 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {roasVal}x
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1.5 border border-slate-800 hover:border-slate-700 hover:text-blue-400 rounded transition cursor-pointer"
                              title="Edit Campaign"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this campaign? All metric tables and insights will be cascade purged.')) {
                                  deleteCampaignMutation.mutate(c.id);
                                }
                              }}
                              className="p-1.5 border border-slate-800 hover:border-red-500/30 hover:text-red-400 rounded transition cursor-pointer"
                              title="Delete Campaign"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 5. SPLIT FOOTER - AI INSIGHTS & SECURITY LOGS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* AI Insights Card Drawer (Col span 2) */}
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Relational Recommendations & Insights
            </h3>

            {isLoadingDetails ? (
              <div className="h-32 flex justify-center items-center">
                <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
              </div>
            ) : allAIInsights.length === 0 ? (
              <div className="p-8 border border-slate-800/80 rounded-lg text-center text-xs text-slate-500">
                Generate campaigns with active metrics to trigger automated alerts.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {allAIInsights.map((insight: any) => {
                  const typeStyles: any = {
                    ALERT: 'border-red-500/20 bg-red-500/5 text-red-400',
                    RECOMMENDATION: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
                    TREND: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                  };

                  return (
                    <div 
                      key={insight.id} 
                      className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${typeStyles[insight.type] || 'border-slate-800'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[9px] tracking-wider uppercase font-mono px-1.5 py-0.5 bg-slate-950/80 rounded border border-slate-800/40">
                            {insight.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">{insight.campaignName}</span>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed">{insight.message}</p>
                      </div>
                      <p className="text-[9px] text-slate-500 text-right mt-3">
                        {new Date(insight.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Security Log (Col span 1) */}
          <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Activity logs
            </h3>
            
            {/* Terminal View */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 h-[218px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2">
              <div className="text-indigo-400 font-bold tracking-wide border-b border-slate-900 pb-1 flex items-center justify-between">
                <span>SYSTEM JOURNAL</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              
              {campaignsList.length === 0 ? (
                <div className="text-slate-600 text-center pt-8">No actions tracked in session.</div>
              ) : (
                campaignsList.slice(0, 8).map((c: any) => (
                  <div key={c.id} className="leading-normal border-b border-slate-900 pb-1.5">
                    <span className="text-slate-600">[{new Date(c.createdAt).toLocaleTimeString()}]</span>{' '}
                    <span className="text-emerald-500 font-semibold">TRACKED</span>{' '}
                    <span className="text-slate-300">Campaign logged: {c.name.substring(0, 15)}...</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </main>

      {/* --- ADD / EDIT CAMPAIGN MODALS --- */}
      {(showAddModal || editingCampaign) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => { setShowAddModal(false); setEditingCampaign(null); resetCampForm(); }}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-100 mb-4">
              {showAddModal ? 'Launch New Ad Campaign' : 'Edit Campaign Configuration'}
            </h3>

            <form onSubmit={showAddModal ? handleCreateCampaignSubmit : handleUpdateCampaignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Campaign Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Target Search Ads"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Marketing Budget ($)</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={campStatus}
                    onChange={(e) => setCampStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={campStart}
                    onChange={(e) => setCampStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={campEnd}
                  onChange={(e) => setCampEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs shadow-lg transition cursor-pointer"
              >
                {showAddModal ? 'Create & Initialize' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
