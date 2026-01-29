
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, trend, trendValue }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-700/30 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
            trend === 'down' ? 'bg-rose-500/10 text-rose-500' : 
            'bg-slate-500/10 text-slate-500'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;
