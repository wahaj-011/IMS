
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Ingredient, StockStatus } from '../types';

interface InventoryTableProps {
  items: Ingredient[];
  onAddItem: (newItem: Ingredient) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (updatedItem: Ingredient) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onAddItem, onDeleteItem, onUpdateItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    currentStock: '',
    unit: 'kg',
    minStockLevel: '',
    unitCost: '',
    expiryDate: '',
    supplierId: 's1'
  });

  const categories = useMemo(() => ['All', ...new Set(items.map(i => i.category))], [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, filterCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatus = (item: Ingredient): { label: StockStatus; color: string } => {
    const now = new Date();
    const expiry = new Date(item.expiryDate);
    
    if (expiry < now) return { label: StockStatus.EXPIRED, color: 'text-rose-500 bg-rose-500/10' };
    if (item.currentStock === 0) return { label: StockStatus.OUT_OF_STOCK, color: 'text-rose-400 bg-rose-400/10' };
    if (item.currentStock <= item.minStockLevel) return { label: StockStatus.LOW_STOCK, color: 'text-amber-500 bg-amber-500/10' };
    return { label: StockStatus.IN_STOCK, color: 'text-emerald-500 bg-emerald-500/10' };
  };

  const handleOpenEdit = (item: Ingredient) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      unit: item.unit,
      minStockLevel: item.minStockLevel.toString(),
      unitCost: item.unitCost.toString(),
      expiryDate: item.expiryDate,
      supplierId: item.supplierId
    });
    setModalMode('edit');
    setActiveMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredientData: Ingredient = {
      id: modalMode === 'edit' ? formData.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category,
      currentStock: Number(formData.currentStock),
      unit: formData.unit,
      minStockLevel: Number(formData.minStockLevel),
      unitCost: Number(formData.unitCost),
      expiryDate: formData.expiryDate,
      supplierId: formData.supplierId,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    if (modalMode === 'edit') {
      onUpdateItem(ingredientData);
    } else {
      onAddItem(ingredientData);
    }
    
    setModalMode(null);
    setFormData({
      id: '',
      name: '',
      category: '',
      currentStock: '',
      unit: 'kg',
      minStockLevel: '',
      unitCost: '',
      expiryDate: '',
      supplierId: 's1'
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
        <div className="relative w-full md:w-96">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search ingredients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={() => setModalMode('add')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium text-sm shadow-lg shadow-emerald-900/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth={2} strokeLinecap="round" /></svg>
            Add Item
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-800/20 min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Ingredient Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Current Stock</th>
              <th className="px-6 py-4">Unit Cost (PKR)</th>
              <th className="px-6 py-4">Total Value</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.map((item) => {
              const status = getStatus(item);
              const isMenuOpen = activeMenuId === item.id;
              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-xs">
                        {item.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{item.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${item.currentStock <= item.minStockLevel ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                      <span className="text-[10px] text-slate-500">Min: {item.minStockLevel} {item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">Rs. {item.unitCost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-white">Rs. {(item.unitCost * item.currentStock).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(item.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenuId(isMenuOpen ? null : item.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth={2} strokeLinecap="round" /></svg>
                    </button>
                    
                    {/* Options Dropdown */}
                    {isMenuOpen && (
                      <div ref={menuRef} className="absolute right-6 top-12 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              onDeleteItem(item.id);
                              setActiveMenuId(null);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-500">No inventory items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setModalMode(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-white">{modalMode === 'edit' ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
                <p className="text-xs text-slate-400 mt-1">{modalMode === 'edit' ? 'Update details for existing raw material' : 'Register a new raw material into the system'}</p>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingredient Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Basmati Rice"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Dry Goods"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>

                {/* Stock Levels */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Stock</label>
                  <div className="relative">
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-4 pr-16 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                    />
                    <select 
                      className="absolute right-2 top-1.5 bottom-1.5 px-2 bg-slate-700 border-l border-slate-600 rounded-lg text-xs outline-none"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    >
                      <option value="kg">kg</option>
                      <option value="liters">liters</option>
                      <option value="grams">grams</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Stock Level (Alert)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({...formData, minStockLevel: e.target.value})}
                  />
                </div>

                {/* Financials & Expiry */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unit Cost (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">Rs.</span>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({...formData, unitCost: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all [color-scheme:dark]"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="flex-1 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-semibold transition-all border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-600/20"
                >
                  {modalMode === 'edit' ? 'Update Item' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
