import React, { useEffect, useState } from 'react';
import { Customer, DeliveryLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">Welcome back! Here is your daily overview.</p>
        </div>
        <button 
            onClick={handleGenerateInsight}
            disabled={isLoadingInsight}
            className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <Sparkles className={`w-4 h-4 ${isLoadingInsight ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            {isLoadingInsight ? "Analyzing..." : "AI Business Insights"}
        </button>
      </div>

      {insight && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-5 animate-scale-in shadow-sm">
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
        {[
            { title: "Today's Milk", value: `${totalDeliveredToday} L`, sub: "+2.5% from yesterday", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Active Customers", value: activeCustomers, sub: `Total registered: ${customers.length}`, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
            { title: "Est. Revenue", value: `₹${todaysRevenue}`, sub: "For today's deliveries", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
            { title: "Pending Dues", value: `₹${pendingCollections}`, sub: "Needs collection", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" }
        ].map((stat, index) => (
            <div 
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slide-up hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                    <div className={`p-2 rounded-full ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                </div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className={`text-xs font-medium mt-1 ${index === 3 ? 'text-red-500' : 'text-slate-400'}`}>{stat.sub}</div>
            </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Delivery Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar 
                    dataKey="litres" 
                    fill="#4f46e5" 
                    radius={[4, 4, 0, 0]} 
                    barSize={32}
                    animationDuration={1500}
                />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;