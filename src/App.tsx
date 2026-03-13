/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Utensils, Sun, Moon, Sunrise, Check, ListPlus, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Dish {
  id: string;
  name: string;
  b: boolean;
  l: boolean;
  d: boolean;
  day: DayOfWeek;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function App() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newDishName, setNewDishName] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);

  const addDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    
    const newDish: Dish = {
      id: crypto.randomUUID(),
      name: newDishName.trim(),
      b: false,
      l: false,
      d: false,
      day: 'Monday',
    };
    
    setDishes([...dishes, newDish]);
    setNewDishName('');
  };

  const addBatchDishes = (e: React.FormEvent) => {
    e.preventDefault();
    const names = batchInput.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length === 0) return;

    const newDishes: Dish[] = names.map(name => ({
      id: crypto.randomUUID(),
      name,
      b: false,
      l: false,
      d: false,
      day: 'Monday',
    }));

    setDishes([...dishes, ...newDishes]);
    setBatchInput('');
    setIsBatchMode(false);
  };

  const toggleSelection = (id: string, field: 'b' | 'l' | 'd') => {
    setDishes(dishes.map(dish => 
      dish.id === id ? { ...dish, [field]: !dish[field] } : dish
    ));
  };

  const updateDay = (id: string, day: DayOfWeek) => {
    setDishes(dishes.map(dish => 
      dish.id === id ? { ...dish, day } : dish
    ));
  };

  const removeDish = (id: string) => {
    setDishes(dishes.filter(dish => dish.id !== id));
  };

  const weeklyPlan = useMemo(() => {
    const plan: Record<DayOfWeek, { b: Dish[], l: Dish[], d: Dish[] }> = DAYS.reduce((acc, day) => {
      acc[day] = { b: [], l: [], d: [] };
      return acc;
    }, {} as any);

    dishes.forEach(dish => {
      if (dish.b) plan[dish.day].b.push(dish);
      if (dish.l) plan[dish.day].l.push(dish);
      if (dish.d) plan[dish.day].d.push(dish);
    });

    return plan;
  }, [dishes]);

  const copyToClipboard = () => {
    let text = `WEEKLY MENU PLAN\n${'='.repeat(20)}\n\n`;
    
    DAYS.forEach(day => {
      const dayPlan = weeklyPlan[day];
      if (dayPlan.b.length || dayPlan.l.length || dayPlan.d.length) {
        text += `${day.toUpperCase()}\n`;
        if (dayPlan.b.length) text += `  Breakfast: ${dayPlan.b.map(d => d.name).join(', ')}\n`;
        if (dayPlan.l.length) text += `  Lunch: ${dayPlan.l.map(d => d.name).join(', ')}\n`;
        if (dayPlan.d.length) text += `  Dinner: ${dayPlan.d.map(d => d.name).join(', ')}\n`;
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text).then(() => {
      alert('Menu plan copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handlePrint = () => {
    // Try standard print first
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.error('Print failed', e);
      // Fallback message
      alert('Printing is blocked by the browser in this preview. Please use the "Copy to Clipboard" button or open the app in a new tab to print.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 print:hidden">
          <h1 className="text-5xl font-serif italic mb-2 tracking-tight">Weekly Menu Planner</h1>
          <p className="text-sm uppercase tracking-widest opacity-50 font-medium">Master Entry & Weekly Schedule</p>
        </header>

        {/* Input Section */}
        <section className="mb-12 bg-white p-8 rounded-3xl shadow-sm border border-black/5 print:hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm uppercase tracking-widest opacity-50 font-bold">Add Dishes</h3>
            <button 
              onClick={() => setIsBatchMode(!isBatchMode)}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              {isBatchMode ? <Plus size={14} /> : <ListPlus size={14} />}
              {isBatchMode ? 'Switch to Single' : 'Switch to Batch Add'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!isBatchMode ? (
              <motion.form 
                key="single"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={addDish} 
                className="flex gap-4"
              >
                <input
                  type="text"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Enter dish name..."
                  className="flex-1 bg-[#F5F5F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#141414] text-white px-8 py-4 rounded-2xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Dish
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="batch"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={addBatchDishes} 
                className="space-y-4"
              >
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="Enter dish names, one per line..."
                  rows={5}
                  className="w-full bg-[#F5F5F0] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-black/5 outline-none transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#141414] text-white px-8 py-4 rounded-2xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
                  >
                    <ListPlus size={20} />
                    Add Batch
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </section>

        {/* Master Entry Table */}
        <section className="mb-16 print:hidden">
          <h2 className="text-2xl font-serif italic mb-6 flex items-center gap-3">
            <Utensils size={24} className="opacity-50" />
            Master Entry Table
          </h2>
          
          <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-black/5 bg-[#F5F5F0]/50">
                  <th className="px-8 py-4 text-xs uppercase tracking-widest opacity-50 font-bold">Dish Name</th>
                  <th className="px-4 py-4 text-xs uppercase tracking-widest opacity-50 font-bold w-40">Day</th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-widest opacity-50 font-bold w-20">B</th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-widest opacity-50 font-bold w-20">L</th>
                  <th className="px-4 py-4 text-center text-xs uppercase tracking-widest opacity-50 font-bold w-20">D</th>
                  <th className="px-8 py-4 text-right w-20"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {dishes.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-black/5"
                    >
                      <td colSpan={6} className="px-8 py-12 text-center opacity-30 italic">
                        No dishes added yet. Start by adding one above.
                      </td>
                    </motion.tr>
                  ) : (
                    dishes.map((dish) => (
                      <motion.tr
                        key={dish.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="border-b border-black/5 hover:bg-[#F5F5F0]/30 transition-colors group"
                      >
                        <td className="px-8 py-4 font-medium">{dish.name}</td>
                        <td className="px-4 py-4">
                          <select 
                            value={dish.day}
                            onChange={(e) => updateDay(dish.id, e.target.value as DayOfWeek)}
                            className="bg-[#F5F5F0] border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none w-full cursor-pointer"
                          >
                            {DAYS.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleSelection(dish.id, 'b')}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${
                              dish.b ? 'bg-[#141414] border-[#141414] text-white' : 'border-black/10 hover:border-black/30'
                            }`}
                          >
                            {dish.b && <Check size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleSelection(dish.id, 'l')}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${
                              dish.l ? 'bg-[#141414] border-[#141414] text-white' : 'border-black/10 hover:border-black/30'
                            }`}
                          >
                            {dish.l && <Check size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleSelection(dish.id, 'd')}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${
                              dish.d ? 'bg-[#141414] border-[#141414] text-white' : 'border-black/10 hover:border-black/30'
                            }`}
                          >
                            {dish.d && <Check size={16} />}
                          </button>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => removeDish(dish.id)}
                            className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </section>

        {/* Weekly Plan Section */}
        <section id="weekly-plan-section" className="space-y-12 print:m-0 print:p-0">
          <h2 className="text-3xl font-serif italic mb-8 flex items-center gap-3 border-b border-black/10 pb-4 print:text-black">
            <Calendar size={32} className="opacity-50 print:hidden" />
            Weekly Plan
          </h2>

          <div className="grid grid-cols-1 gap-12 print:gap-8">
            {DAYS.map(day => (
              <div key={day} className="space-y-6 print:break-inside-avoid">
                <h3 className="text-2xl font-serif italic border-l-4 border-[#141414] pl-4 print:border-black">{day}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
                  {/* Breakfast */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 print:border-black/20 print:p-4">
                    <h4 className="text-xs uppercase tracking-widest opacity-50 font-bold mb-4 flex items-center gap-2 print:opacity-100">
                      <Sunrise size={14} className="text-orange-500 print:text-black" />
                      Breakfast
                    </h4>
                    <div className="space-y-2">
                      {weeklyPlan[day].b.length === 0 ? (
                        <p className="text-xs opacity-30 italic">No items</p>
                      ) : (
                        weeklyPlan[day].b.map(dish => (
                          <div key={dish.id} className="text-sm font-medium py-1 border-b border-black/5 last:border-0">
                            {dish.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 print:border-black/20 print:p-4">
                    <h4 className="text-xs uppercase tracking-widest opacity-50 font-bold mb-4 flex items-center gap-2 print:opacity-100">
                      <Sun size={14} className="text-yellow-500 print:text-black" />
                      Lunch
                    </h4>
                    <div className="space-y-2">
                      {weeklyPlan[day].l.length === 0 ? (
                        <p className="text-xs opacity-30 italic">No items</p>
                      ) : (
                        weeklyPlan[day].l.map(dish => (
                          <div key={dish.id} className="text-sm font-medium py-1 border-b border-black/5 last:border-0">
                            {dish.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 print:border-black/20 print:p-4">
                    <h4 className="text-xs uppercase tracking-widest opacity-50 font-bold mb-4 flex items-center gap-2 print:opacity-100">
                      <Moon size={14} className="text-indigo-500 print:text-black" />
                      Dinner
                    </h4>
                    <div className="space-y-2">
                      {weeklyPlan[day].d.length === 0 ? (
                        <p className="text-xs opacity-30 italic">No items</p>
                      ) : (
                        weeklyPlan[day].d.map(dish => (
                          <div key={dish.id} className="text-sm font-medium py-1 border-b border-black/5 last:border-0">
                            {dish.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-12 pb-24 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-[#141414] text-white px-12 py-5 rounded-2xl font-medium hover:bg-black/80 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl active:scale-95 w-full md:w-auto justify-center"
            >
              <Calendar size={20} />
              Print Menu Plan
            </button>
            <button
              onClick={copyToClipboard}
              className="bg-white text-[#141414] border border-black/10 px-12 py-5 rounded-2xl font-medium hover:bg-[#F5F5F0] transition-all flex items-center gap-3 shadow-lg hover:shadow-xl active:scale-95 w-full md:w-auto justify-center"
            >
              <ListPlus size={20} />
              Copy to Clipboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
