import React, { useState } from 'react';
import { Backpack, CheckSquare, Square, Plus, Trash2, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { PackingItem, SupportedLanguage } from '../types';
import confetti from 'canvas-confetti';

interface PackingSectionProps {
  items: PackingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (name: string, category: PackingItem['category']) => void;
  onDeleteItem: (id: string) => void;
  language: SupportedLanguage;
}

const CATEGORIES: PackingItem['category'][] = [
  'Essentials',
  'Clothing',
  'Tech',
  'Health & Toiletries',
  'Documents',
];

export const PackingSection: React.FC<PackingSectionProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  language,
}) => {
  const isHinglish = language === 'hi_hinglish';
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<PackingItem['category']>('Essentials');

  const totalItems = items.length;
  const packedItems = items.filter((i) => i.isChecked).length;
  const progressPct = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const handleToggle = (id: string) => {
    onToggleItem(id);
    const item = items.find((i) => i.id === id);
    if (item && !item.isChecked && packedItems + 1 === totalItems) {
      // Packed all celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newItemCat);
    setNewItemName('');
  };

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter((i) => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isHinglish ? 'Smart AI Packing Checklist' : 'Smart Luggage & Packing Checklist'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHinglish 
                  ? `${totalItems} me se ${packedItems} items pack ho gaye hain` 
                  : `${packedItems} of ${totalItems} essentials packed`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-600">{progressPct}%</span>
              <span className="text-xs text-slate-400 block">{isHinglish ? 'Taiyyari' : 'Ready'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {progressPct === 100 && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{isHinglish ? '🎉 Shandaar! Aapki packing 100% complete ho chuki hai!' : '🎉 Amazing! You are 100% packed and ready to fly!'}</span>
          </div>
        )}
      </div>

      {/* Add Custom Item */}
      <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={isHinglish ? 'Naya item add karein (e.g. Extra Camera Battery, Umbrella)...' : 'Add a custom packing item (e.g. Hiking shoes, Power adapter)...'}
          className="w-full sm:flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium outline-none focus:border-emerald-500"
        />
        <select
          value={newItemCat}
          onChange={(e) => setNewItemCat(e.target.value as PackingItem['category'])}
          className="w-full sm:w-auto px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isHinglish ? 'Add Item' : 'Add Item'}</span>
        </button>
      </form>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isHinglish ? 'All Items' : 'All Items'} ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Item List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              item.isChecked
                ? 'bg-emerald-50/50 border-emerald-200 text-slate-400'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
              <div className="text-emerald-600 shrink-0">
                {item.isChecked ? (
                  <CheckSquare className="w-5 h-5 fill-emerald-600 text-white" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                )}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${item.isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {item.name}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {item.category}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition-opacity"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
