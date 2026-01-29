
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MenuItem, Ingredient } from '../types';

interface RecipeTableProps {
  recipes: MenuItem[];
  inventory: Ingredient[];
  onAdd: (r: MenuItem) => void;
  onUpdate: (r: MenuItem) => void;
  onDelete: (id: string) => void;
}

const RecipeTable: React.FC<RecipeTableProps> = ({ recipes, inventory, onAdd, onUpdate, onDelete }) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<MenuItem>({
    id: '', name: '', category: 'Main Course', price: 0, ingredients: []
  });

  const getRecipeCost = (recipe: MenuItem) => {
    return recipe.ingredients.reduce((acc, curr) => {
      const ing = inventory.find(i => i.id === curr.ingredientId);
      return acc + (ing ? ing.unitCost * curr.quantity : 0);
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'edit') onUpdate(formData);
    else onAdd({ ...formData, id: Math.random().toString(36).substr(2, 9) });
    setModalMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
        <button onClick={() => { setFormData({ id: '', name: '', category: 'Main Course', price: 0, ingredients: [] }); setModalMode('add'); }} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium text-sm">
          Create New Recipe
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-800/20">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Menu Item</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Ingredients Used</th>
              <th className="px-6 py-4">Production Cost</th>
              <th className="px-6 py-4">Selling Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {recipes.map(r => {
              const cost = getRecipeCost(r);
              return (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{r.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{r.ingredients.length} items</td>
                  <td className="px-6 py-4 text-sm font-bold text-amber-400">Rs. {cost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-400">Rs. {r.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setActiveMenuId(activeMenuId === r.id ? null : r.id)} className="p-2 text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth={2} strokeLinecap="round" /></svg></button>
                    {activeMenuId === r.id && (
                      <div ref={menuRef} className="absolute right-6 top-12 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                        <button onClick={() => { setFormData(r); setModalMode('edit'); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">Edit</button>
                        <button onClick={() => { if(window.confirm('Delete recipe?')) onDelete(r.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md" onClick={() => setModalMode(null)} />
          <div className="relative bg-slate-900 border border-slate-700/50 w-full max-w-xl rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">{modalMode === 'edit' ? 'Edit Recipe' : 'Add New Recipe'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Item Name" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Category" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                <input required type="number" placeholder="Selling Price" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase">Ingredients Mapping</p>
                {inventory.slice(0, 5).map(ing => {
                  const currentLink = formData.ingredients.find(i => i.ingredientId === ing.id);
                  return (
                    <div key={ing.id} className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg">
                      <span className="flex-1 text-sm">{ing.name}</span>
                      <input 
                        type="number" step="0.01" placeholder="Qty" 
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm"
                        value={currentLink?.quantity || ''}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val === 0) {
                            setFormData({...formData, ingredients: formData.ingredients.filter(i => i.ingredientId !== ing.id)});
                          } else {
                            const exists = formData.ingredients.find(i => i.ingredientId === ing.id);
                            if (exists) {
                              setFormData({...formData, ingredients: formData.ingredients.map(i => i.ingredientId === ing.id ? {...i, quantity: val} : i)});
                            } else {
                              setFormData({...formData, ingredients: [...formData.ingredients, { ingredientId: ing.id, quantity: val }]});
                            }
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-3 bg-slate-800 rounded-xl border border-slate-700">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 rounded-xl shadow-lg">Save Recipe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeTable;
