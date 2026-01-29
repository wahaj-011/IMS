
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Supplier } from '../types';

interface SupplierTableProps {
  suppliers: Supplier[];
  onAdd: (s: Supplier) => void;
  onUpdate: (s: Supplier) => void;
  onDelete: (id: string) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onAdd, onUpdate, onDelete }) => {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Supplier>({
    id: '', name: '', contactPerson: '', phone: '', location: 'Lahore', paymentTerms: 'Cash', balance: 0
  });

  const filtered = useMemo(() => {
    return suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [suppliers, searchTerm]);

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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
        <input 
          type="text" 
          placeholder="Search vendors..." 
          className="w-full md:w-96 pl-4 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => { setFormData({ id: '', name: '', contactPerson: '', phone: '', location: 'Lahore', paymentTerms: 'Cash', balance: 0 }); setModalMode('add'); }} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium text-sm">
          Add Vendor
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-800/20">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Vendor Name</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Contact Person</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Balance (PKR)</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-200">{s.name}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{s.location}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{s.contactPerson}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{s.phone}</td>
                <td className="px-6 py-4 text-sm font-bold text-rose-400">Rs. {s.balance.toLocaleString()}</td>
                <td className="px-6 py-4 text-right relative">
                  <button onClick={() => setActiveMenuId(activeMenuId === s.id ? null : s.id)} className="p-2 text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeWidth={2} strokeLinecap="round" /></svg></button>
                  {activeMenuId === s.id && (
                    <div ref={menuRef} className="absolute right-6 top-12 w-32 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
                      <button onClick={() => { setFormData(s); setModalMode('edit'); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">Edit</button>
                      <button onClick={() => { if(window.confirm('Delete vendor?')) onDelete(s.id); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md" onClick={() => setModalMode(null)} />
          <div className="relative bg-slate-900 border border-slate-700/50 w-full max-w-xl rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">{modalMode === 'edit' ? 'Edit Vendor' : 'Add New Vendor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Vendor Name" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Contact Person" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                <input required placeholder="Phone" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="City" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                <input required type="number" placeholder="Balance" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalMode(null)} className="flex-1 py-3 bg-slate-800 rounded-xl font-semibold border border-slate-700">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 rounded-xl font-semibold shadow-lg">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierTable;
