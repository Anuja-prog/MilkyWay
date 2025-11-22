import React, { useEffect, useState } from 'react';
import { Customer, DeliveryLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { analyzeBusinessInsights } from '../services/geminiService';
import { Sparkles, TrendingUp, Droplets, Users, IndianRupee } from 'lucide-react';

interface DashboardProps {
  customers: Customer[];
  logs: DeliveryLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, logs }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Calculate Stats
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = logs.filter(l => l.date === today);
  
  const totalDeliveredToday = todaysLogs.reduce((acc, curr) => acc + curr.quantity, 0);
  const activeCustomers = customers.filter(c => c.isActive).length;
  
  // Estimate Revenue
  const todaysRevenue = todaysLogs.reduce((acc, log) => {
    const customer = customers.find(c => c.id === log.customerId);
    return acc + (log.quantity * (customer?.pricePerLitre || 0));
  }, 0);

  const pendingCollections = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0);

  // Prepare Chart Data (Last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayLogs = logs.filter(l => l.date === date);
    const litres = dayLogs.reduce((sum, l) => sum + l.quantity, 0);
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      litres: litres
    };
  });

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true);
    const result = await analyzeBusinessInsights(totalDeliveredToday, todaysRevenue, activeCustomers);
    setInsight(result);
    setIsLoadingInsight(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">Welcome back! Here is your daily overview.</p>
        </div>
        <button 
            onClick={handleGenerateInsight}
            disabled={isLoadingInsight}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
        >
            <Sparkles className="w-4 h-4" />
            {isLoadingInsight ? "Analyzing..." : "AI Business Insights"}
        </button>
      </div>

      {insight && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-fade-in">
            <h3 className="flex items-center gap-2 font-semibold text-indigo-900 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Gemini Insights
            </h3>
            <div className="text-indigo-800 text-sm whitespace-pre-line leading-relaxed">
                {insight}
            </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 text-sm font-medium">Today's Milk</h3>
                <div className="p-2 bg-blue-50 rounded-full">
                    <Droplets className="w-5 h-5 text-blue-600" />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{totalDeliveredToday} L</div>
            <div className="text-xs text-green-600 font-medium mt-1">+2.5% from yesterday</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 text-sm font-medium">Active Customers</h3>
                <div className="p-2 bg-orange-50 rounded-full">
                    <Users className="w-5 h-5 text-orange-600" />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{activeCustomers}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">Total registered: {customers.length}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 text-sm font-medium">Est. Revenue</h3>
                <div className="p-2 bg-green-50 rounded-full">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">₹{todaysRevenue}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">For today's deliveries</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 text-sm font-medium">Pending Dues</h3>
                <div className="p-2 bg-red-50 rounded-full">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">₹{pendingCollections}</div>
            <div className="text-xs text-red-500 font-medium mt-1">Needs collection</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Delivery Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="litres" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
