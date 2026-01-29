
import React from 'react';
import { Ingredient, MenuItem } from '../types';

interface ChartProps {
  inventory: Ingredient[];
  recipes: MenuItem[];
}

export const DashboardCharts: React.FC<ChartProps> = ({ inventory, recipes }) => {
  // Process Data: Category Distribution
  // Add explicit types to reduce to avoid arithmetic errors and unknown types from Object.values
  const categoryTotals = inventory.reduce((acc: Record<string, number>, item: Ingredient) => {
    // Explicitly cast to Number to avoid arithmetic errors if types are misaligned
    const itemValue = Number(item.unitCost) * Number(item.currentStock);
    acc[item.category] = (acc[item.category] || 0) + itemValue;
    return acc;
  }, {} as Record<string, number>);

  const donutData = Object.entries(categoryTotals)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Process Data: Top 5 Items by Value
  const topItems = [...inventory]
    .sort((a, b) => (Number(b.unitCost) * Number(b.currentStock)) - (Number(a.unitCost) * Number(a.currentStock)))
    .slice(0, 5);

  // Ensure totalValue is calculated with explicit number types and avoid division by zero
  const totalValue = Object.values(categoryTotals).reduce((a: number, b: number) => a + b, 0) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Category Distribution Donut */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Stock by Category</h3>
          <span className="text-xs text-slate-500 font-medium">Value Distribution</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#1e293b" strokeWidth="3" />
              {/* Fix: Use an IIFE to handle loop logic and variable tracking for stroke offsets within JSX */}
              {(() => {
                let offset = 0;
                const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
                return donutData.map((d, i) => {
                  const percentage = (d.value / totalValue) * 100;
                  const strokeDash = `${percentage} ${100 - percentage}`;
                  const currentOffset = offset;
                  offset += percentage;
                  return (
                    <circle
                      key={d.label}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke={colors[i % colors.length]}
                      strokeWidth="3.5"
                      strokeDasharray={strokeDash}
                      strokeDashoffset={-currentOffset}
                      className="transition-all duration-1000 ease-out"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Allocated</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            {donutData.map((d, i) => {
              const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];
              return (
                <div key={d.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{d.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-400">
                    {((d.value / totalValue) * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Inventory Items Bar Chart */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">High-Value Inventory</h3>
          <span className="text-xs text-slate-500 font-medium">Top 5 Items (PKR)</span>
        </div>
        <div className="space-y-5">
          {topItems.map((item) => {
            const itemValue = Number(item.unitCost) * Number(item.currentStock);
            // Fix: Safeguard against empty inventory and property access errors
            const maxVal = topItems.length > 0 ? (Number(topItems[0].unitCost) * Number(topItems[0].currentStock)) : 1;
            const width = (itemValue / (maxVal || 1)) * 100;
            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className="text-emerald-400 font-bold">Rs. {itemValue.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipe Profit Margin Grid */}
      <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Recipe Profitability</h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparing production cost vs. menu price</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recipes.slice(0, 3).map(recipe => {
            // Fix: Add explicit typing to reduce accumulator and cast properties to Number
            const cost = recipe.ingredients.reduce((acc: number, curr) => {
              const ing = inventory.find(i => i.id === curr.ingredientId);
              return acc + (ing ? Number(ing.unitCost) * Number(curr.quantity) : 0);
            }, 0);
            const sellingPrice = Number(recipe.price) || 1;
            const margin = ((sellingPrice - cost) / sellingPrice) * 100;
            return (
              <div key={recipe.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-xl hover:border-emerald-500/30 transition-all">
                <h4 className="text-sm font-bold text-slate-200 mb-4">{recipe.name}</h4>
                <div className="flex items-end gap-2 mb-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-24 bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end">
                       <div className="w-1/2 bg-rose-500/60 rounded-t-sm" style={{ height: `${(cost/sellingPrice)*100}%` }} />
                       <div className="w-1/2 bg-emerald-500/60 rounded-t-sm" style={{ height: '100%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                      <span>Cost</span>
                      <span>Price</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-emerald-400">{margin.toFixed(0)}%</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Gross Margin</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
