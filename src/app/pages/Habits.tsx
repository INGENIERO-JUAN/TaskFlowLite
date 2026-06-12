/**
 * Habits Page — Rastreador de hábitos diarios.
 * Dark mode completo + NavbarAuth eliminada (viene del DashboardLayout).
 */
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Flame, CheckCircle2, Circle, Trophy, Target } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input }  from "../components/ui/input";
import { Modal }  from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  color: HabitColor;
  completedDates: string[];
  createdAt: string;
}

type HabitColor = "blue" | "green" | "purple" | "orange" | "pink" | "red";

const colorConfig: Record<HabitColor, { bg: string; text: string; ring: string; bar: string }> = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/40",    text: "text-blue-600",   ring: "ring-blue-400",   bar: "bg-blue-500"   },
  green:  { bg: "bg-green-50 dark:bg-green-950/40",  text: "text-green-600",  ring: "ring-green-400",  bar: "bg-green-500"  },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/40",text: "text-purple-600", ring: "ring-purple-400", bar: "bg-purple-500" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/40",text: "text-orange-600", ring: "ring-orange-400", bar: "bg-orange-500" },
  pink:   { bg: "bg-pink-50 dark:bg-pink-950/40",    text: "text-pink-600",   ring: "ring-pink-400",   bar: "bg-pink-500"   },
  red:    { bg: "bg-red-50 dark:bg-red-950/40",      text: "text-red-600",    ring: "ring-red-400",    bar: "bg-red-500"    },
};

const COLORS: HabitColor[] = ["blue", "green", "purple", "orange", "pink", "red"];
const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "🎯", "🍎", "😴", "✍️", "🎨", "🎵", "🌿"];
const EMPTY_FORM = { name: "", emoji: "💪", color: "blue" as HabitColor };

function toDateStr(date: Date) { return date.toISOString().split("T")[0]; }

function getStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = toDateStr(new Date());
  let streak = 0;
  const current = new Date();
  if (sorted[0] !== today) current.setDate(current.getDate() - 1);
  for (const d of sorted) {
    if (d === toDateStr(current)) { streak++; current.setDate(current.getDate() - 1); } else break;
  }
  return streak;
}

function getLast7Days(): { label: string; date: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 2), date: toDateStr(d) };
  });
}

function getCompletionRate(completedDates: string[], createdAt: string): number {
  const start = new Date(createdAt);
  const today = new Date();
  const totalDays = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
  return Math.round((completedDates.length / totalDays) * 100);
}

export function Habits() {
  const { user } = useAuth();
  const storageKey = `habits_${user?.email ?? "guest"}`;

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) as Habit[] : [];
    } catch {
      return [];
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });

  const today = toDateStr(new Date());
  const last7Days = getLast7Days();

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(habits)); }, [habits, storageKey]);

  const toggleDay = (habitId: number, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h;
      const has = h.completedDates.includes(date);
      return { ...h, completedDates: has ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date] };
    }));
  };

  const handleCreate = () => {
    if (!form.name.trim()) return;
    setHabits(prev => [{
      id: Date.now(), name: form.name, emoji: form.emoji, color: form.color,
      completedDates: [], createdAt: new Date().toISOString(),
    }, ...prev]);
    setIsModalOpen(false);
  };

  const handleDelete = (habit: Habit) => {
    setHabits(prev => prev.filter(h => h.id !== habit.id));
    setDeleteHabit(null);
  };

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const bestStreak     = habits.reduce((max, h) => Math.max(max, getStreak(h.completedDates)), 0);
  const totalRate      = habits.length
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h.completedDates, h.createdAt), 0) / habits.length)
    : 0;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>Mis Hábitos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{completedToday}/{habits.length} completados hoy</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={16} />}
          onClick={() => { setForm({ ...EMPTY_FORM }); setIsModalOpen(true); }}>
          Nuevo hábito
        </Button>
      </div>

      {/* KPI Cards */}
      {habits.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Hoy",           value: `${completedToday.toString()}/${habits.length.toString()}`, sub: "completados",     icon: <CheckCircle2 size={16} className="text-green-500" />,  color: "text-green-600"  },
            { label: "Mejor racha",   value: String(bestStreak),                                           sub: "días seguidos",   icon: <Flame size={16} className="text-orange-500" />,        color: "text-orange-600" },
            { label: "Cumplimiento",  value: `${totalRate.toString()}%`,                                   sub: "promedio global", icon: <Trophy size={16} className="text-purple-500" />,       color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">{s.icon}<span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span></div>
              <p className={`text-2xl ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lista de hábitos */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-gray-400">
          <Target size={48} className="text-gray-300 dark:text-gray-600" />
          <p className="text-sm">Aún no tienes hábitos registrados</p>
          <Button variant="secondary" size="sm" icon={<Plus size={14} />}
            onClick={() => { setForm({ ...EMPTY_FORM }); setIsModalOpen(true); }}>
            Crear primer hábito
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header días */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1" />
            <div className="flex gap-1.5">
              {last7Days.map(d => (
                <div key={d.date} className={`w-9 text-center text-xs font-medium ${d.date === today ? "text-blue-600" : "text-gray-400 dark:text-gray-500"}`}>{d.label}</div>
              ))}
            </div>
            <div className="w-7" />
          </div>

          {habits.map(habit => {
            const cfg = colorConfig[habit.color];
            const streak = getStreak(habit.completedDates);
            const rate = getCompletionRate(habit.completedDates, habit.createdAt);
            const doneToday = habit.completedDates.includes(today);
            return (
              <div key={habit.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${cfg.bg}`}>{habit.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-900 dark:text-white truncate" style={{ fontWeight: 600 }}>{habit.name}</p>
                      {streak > 0 && <span className="flex items-center gap-0.5 text-xs text-orange-500 shrink-0"><Flame size={12} />{streak}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${cfg.bar}`} style={{ width: `${rate.toString()}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{rate}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {last7Days.map(d => {
                      const done = habit.completedDates.includes(d.date);
                      const isToday = d.date === today;
                      return (
                        <button key={d.date} onClick={() => { toggleDay(habit.id, d.date); }}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border-none ${
                            done
                              ? `${cfg.bg} ${cfg.text} ${isToday ? `ring-2 ${cfg.ring}` : ""}`
                              : `bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 ${isToday ? "ring-2 ring-gray-300 dark:ring-gray-600" : ""}`
                          }`}>
                          {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => { setDeleteHabit(habit); }}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer ml-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                {doneToday && (
                  <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${cfg.bg} ${cfg.text}`} style={{ fontWeight: 500 }}>
                    {streak >= 7 ? `🔥 ¡Increíble! ${streak.toString()} días seguidos` : streak >= 3 ? `💪 ¡Vas bien! ${streak.toString()} días seguidos` : "✅ ¡Completado hoy! Sigue así"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal crear hábito */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); }} title="Nuevo hábito" size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsModalOpen(false); }}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!form.name.trim()}>Crear hábito</Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <Input label="Nombre del hábito *" type="text" placeholder="Ej: Leer 30 minutos..."
            value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); }} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { setForm({ ...form, emoji: e }); }}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center cursor-pointer transition-all border ${form.emoji === e ? "bg-blue-50 dark:bg-blue-950 border-blue-400 scale-110" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => { setForm({ ...form, color: c }); }}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all border-2 ${colorConfig[c].bar} ${form.color === c ? "border-gray-800 dark:border-white scale-110" : "border-transparent hover:scale-105"}`} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!deleteHabit} onClose={() => { setDeleteHabit(null); }} title="Eliminar hábito" size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteHabit(null); }}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => { if (deleteHabit) handleDelete(deleteHabit); }}>Sí, eliminar</Button>
          </>
        }>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            ¿Eliminar el hábito <strong>&ldquo;{deleteHabit?.name}&rdquo;</strong>? Perderás todo tu historial y racha.
          </p>
        </div>
      </Modal>
    </main>
  );
}
