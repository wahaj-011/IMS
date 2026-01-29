
import React from 'react';
import { ICONS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ICONS.Dashboard },
    { id: 'inventory', name: 'Stock Management', icon: ICONS.Inventory },
    { id: 'recipes', name: 'Recipe Costing', icon: ICONS.Recipes },
    { id: 'suppliers', name: 'Supplier Portal', icon: ICONS.Suppliers },
    { id: 'compliance', name: 'FBR & Tax', icon: ICONS.Compliance },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col fixed h-screen">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-[#0f172a] font-bold">P</div>
        <h1 className="text-xl font-bold tracking-tight">PakResto <span className="text-emerald-500 text-sm">ERP</span></h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/40 p-3 rounded-xl">
          <p className="text-xs text-slate-500 mb-1">POS Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">FBR Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
