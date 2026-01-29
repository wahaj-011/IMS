
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import InventoryTable from './components/InventoryTable';
import SupplierTable from './components/SupplierTable';
import RecipeTable from './components/RecipeTable';
import { DashboardCharts } from './components/DashboardCharts';
import { Ingredient, Supplier, MenuItem, QuickStats } from './types';

const MOCK_INVENTORY: Ingredient[] = [
  { id: '1', name: 'Basmati Rice', category: 'Dry Goods', currentStock: 45, unit: 'kg', minStockLevel: 20, unitCost: 450, expiryDate: '2025-12-01', supplierId: 's1', lastRestocked: '2024-03-01' },
  { id: '2', name: 'Pure Ghee', category: 'Dairy', currentStock: 5, unit: 'kg', minStockLevel: 10, unitCost: 1800, expiryDate: '2024-05-15', supplierId: 's2', lastRestocked: '2024-02-15' },
  { id: '3', name: 'Chicken Breast', category: 'Meat', currentStock: 25, unit: 'kg', minStockLevel: 15, unitCost: 850, expiryDate: '2024-03-20', supplierId: 's3', lastRestocked: '2024-03-18' },
  { id: '4', name: 'Cooking Oil', category: 'Fats', currentStock: 120, unit: 'liters', minStockLevel: 40, unitCost: 520, expiryDate: '2025-01-10', supplierId: 's1', lastRestocked: '2024-03-05' },
];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Al-Barakah Foods', contactPerson: 'Ahmed Khan', phone: '0300-1234567', location: 'Lahore', paymentTerms: 'Net 30', balance: 45000 },
  { id: 's2', name: 'Punjab Dairy Solutions', contactPerson: 'Sara Ali', phone: '0321-7654321', location: 'Faisalabad', paymentTerms: 'Cash', balance: 12000 },
];

const MOCK_RECIPES: MenuItem[] = [
  { id: 'r1', name: 'Chicken Biryani', category: 'Main Course', price: 1200, ingredients: [{ ingredientId: '1', quantity: 0.5 }, { ingredientId: '2', quantity: 0.05 }, { ingredientId: '3', quantity: 0.25 }] },
  { id: 'r2', name: 'Ghee Roti', category: 'Bread', price: 80, ingredients: [{ ingredientId: '2', quantity: 0.02 }] },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Persisted States
  const [inventory, setInventory] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('p_inventory');
    return saved ? JSON.parse(saved) : MOCK_INVENTORY;
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('p_suppliers');
    return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
  });

  const [recipes, setRecipes] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('p_recipes');
    return saved ? JSON.parse(saved) : MOCK_RECIPES;
  });

  const [stats, setStats] = useState<QuickStats>({
    totalInventoryValue: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    pendingPayables: 0,
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('p_inventory', JSON.stringify(inventory));
    localStorage.setItem('p_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('p_recipes', JSON.stringify(recipes));
  }, [inventory, suppliers, recipes]);

  // Calculate Stats
  useEffect(() => {
    const totalVal = inventory.reduce((acc, curr) => acc + (curr.unitCost * curr.currentStock), 0);
    const lowStock = inventory.filter(i => i.currentStock <= i.minStockLevel).length;
    const expiring = inventory.filter(i => {
      const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
      return diff < (7 * 24 * 60 * 60 * 1000);
    }).length;
    const payables = suppliers.reduce((acc, curr) => acc + curr.balance, 0);

    setStats({
      totalInventoryValue: totalVal,
      lowStockItems: lowStock,
      expiringSoon: expiring,
      pendingPayables: payables
    });
  }, [inventory, suppliers]);

  // Export Logic
  const handleExportCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Operations Overview</h1>
                <p className="text-slate-400">Real-time insights for your restaurant network</p>
              </div>
              <button 
                onClick={() => handleExportCSV(inventory, 'Inventory_Report')}
                className="bg-slate-800 px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Report
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Inventory Value" value={`Rs. ${stats.totalInventoryValue.toLocaleString()}`} trend="up" trendValue="12.5%" icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Low Stock Alerts" value={stats.lowStockItems} subValue="Items below threshold" trend={stats.lowStockItems > 0 ? "up" : "neutral"} trendValue={stats.lowStockItems.toString()} icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
              <StatCard label="Expiring Soon" value={stats.expiringSoon} subValue="Critical window: 7 days" icon={<svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              <StatCard label="Total Payables" value={`Rs. ${stats.pendingPayables.toLocaleString()}`} subValue={`Owed to ${suppliers.length} vendors`} icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
            </div>

            <DashboardCharts inventory={inventory} recipes={recipes} />
          </div>
        );
      case 'inventory':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Stock Management</h1>
                <p className="text-slate-400">Real-time inventory levels with automated FIFO tracking.</p>
              </div>
              <button 
                onClick={() => handleExportCSV(inventory, 'Inventory_Export')}
                className="bg-emerald-600/10 text-emerald-500 px-6 py-2.5 rounded-xl text-sm font-semibold border border-emerald-500/20 hover:bg-emerald-600/20 transition-all flex items-center gap-2"
              >
                Download CSV
              </button>
            </header>
            <InventoryTable 
              items={inventory} 
              onAddItem={(n) => setInventory([n, ...inventory])}
              onUpdateItem={(u) => setInventory(inventory.map(i => i.id === u.id ? u : i))}
              onDeleteItem={(id) => setInventory(inventory.filter(i => i.id !== id))}
            />
          </div>
        );
      case 'suppliers':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Supplier Portal</h1>
                <p className="text-slate-400">Manage vendors, track payables, and local procurement.</p>
              </div>
            </header>
            <SupplierTable 
              suppliers={suppliers}
              onAdd={(n) => setSuppliers([n, ...suppliers])}
              onUpdate={(u) => setSuppliers(suppliers.map(s => s.id === u.id ? u : s))}
              onDelete={(id) => setSuppliers(suppliers.filter(s => s.id !== id))}
            />
          </div>
        );
      case 'recipes':
        return (
          <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Recipe Costing</h1>
                <p className="text-slate-400">Link ingredients to menu items and monitor food costs.</p>
              </div>
            </header>
            <RecipeTable 
              recipes={recipes}
              inventory={inventory}
              onAdd={(n) => setRecipes([n, ...recipes])}
              onUpdate={(u) => setRecipes(recipes.map(r => r.id === u.id ? u : r))}
              onDelete={(id) => setRecipes(recipes.filter(r => r.id !== id))}
            />
          </div>
        );
      case 'compliance':
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">FBR Tier-1 System Status</h2>
              <p className="text-slate-400 mb-8 max-w-md text-center">Your POS is currently linked with Federal Board of Revenue and Punjab Revenue Authority (PRA).</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl px-8">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Today's Reported Sales</p>
                  <p className="text-xl font-bold text-white">Rs. 142,500</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tax Collected (SRB/PRA)</p>
                  <p className="text-xl font-bold text-white">Rs. 22,800</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Sync Status</p>
                  <p className="text-xl font-bold text-emerald-500">Live</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
