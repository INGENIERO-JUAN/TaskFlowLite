/**
 * Habits Page — Módulo de hábitos diarios.
 * Rastrear hábitos con racha, calendario semanal y progreso.
 * Persistencia en localStorage por usuario.
 */
import React, { useState, useEffect } from "react";
import { NavbarAuth } from "../components/NavbarAuth";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import {
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  Circle,
  Target,
  Edit3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type HabitColor = "blue" | "green" | "purple" | "orange" | "red";

interface Habit {
  id: number;
  name: string;
  description: string;
  color: HabitColor;
  emoji: string;
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
  createdAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const colorConfig: Record<HabitColor, { bg: string; text: string; ring: string; dot: string }> = {
  blue:   { bg: "bg-blue-100",   text: "text-blue-700",   ring: "ring-blue-400",   dot: "bg-blue-500"   },
  green:  { bg: "bg-green-100",  text: "text-green-700",  ring: "ring-green-400",  dot: "bg-green-500"  },
  purple: { bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-400", dot: "bg-purple-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", ring: "ring-orange-400", dot: "bg-orange-500" },
  red:    { bg: "bg-red-100",    text: "text-red-700",    ring: "ring-red-400",    dot: "bg-red-500"    },
};

const EMOJIS = ["💪", "📚", "🏃", "💧", "🧘", "✍️", "🎯", "🍎", "😴", "🌱"];

const EMPTY_FORM = { name: "", description: "", color: "blue" as HabitColor, emoji: "🎯" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = toDateStr(new Date());
  let streak = 0;
  let current = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = toDateStr(current);
    if (sorted.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (dateStr === today) {
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getLast7Days(): { date: Date; str: string; label: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d,
      str: toDateStr(d),
      label: d.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 2),
    });
  }
  return days;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Habits() {
  const { user } = useAuth();
  const storageKey = `taskflow_habits_${user?.email}`;

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const today = toDateStr(new Date());
  const last7 = getLast7Days();

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(habits));
  }, [habits, storageKey]);

  const toggleToday = (habitId: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const already = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: already
            ? h.completedDates.filter((d) => d !== today)
            : [...h.completedDates, today],
        };
      })
    );
  };

  const openCreate = () => {
    setEditingHabit(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setForm({ name: habit.name, description: habit.description, color: habit.color, emoji: habit.emoji });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) => h.id === editingHabit.id ? { ...h, ...form } : h)
      );
    } else {
      setHabits((prev) => [
        { id: Date.now(), ...form, completedDates: [], createdAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (habit: Habit) => {
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setDeleteHabit(null);
  };

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, getStreak(h.completedDates)), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAuth />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Mis Hábitos
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {totalHabits === 0
                ? "Crea tu primer hábito y empieza a rastrearlo"
                : `${completedToday} de ${totalHabits} hábitos completados hoy`}
            </p>
          </div>
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreate}>
            Nuevo hábito
          </Button>
        </div>

        {/* KPIs */}
        {totalHabits > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hábitos activos</p>
                <p className="text-2xl text-blue-600" style={{ fontWeight: 700 }}>{totalHabits}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completados hoy</p>
                <p className="text-2xl text-green-600" style={{ fontWeight: 700 }}>{completedToday}/{totalHabits}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Mejor racha activa</p>
                <p className="text-2xl text-orange-500" style={{ fontWeight: 700 }}>{bestStreak} días</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {habits.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-sm mb-1 text-gray-500" style={{ fontWeight: 500 }}>No tienes hábitos todavía</p>
            <p className="text-xs text-gray-400 mb-4">Empieza con algo pequeño — un hábito diario cambia todo</p>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={openCreate}>
              Crear primer hábito
            </Button>
          </div>
        )}

        {/* Lista de hábitos */}
        <div className="flex flex-col gap-4">
          {habits.map((habit) => {
            const c = colorConfig[habit.color];
            const streak = getStreak(habit.completedDates);
            const doneToday = habit.completedDates.includes(today);

            return (
              <div
                key={habit.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 group"
              >
                <div className="flex items-start gap-4">
                  {/* Emoji + toggle */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${c.bg}`}>
                      {habit.emoji}
                    </div>
                    <button
                      onClick={() => toggleToday(habit.id)}
                      className="cursor-pointer transition-transform hover:scale-110"
                      title={doneToday ? "Marcar como no completado" : "Marcar como completado hoy"}
                    >
                      {doneToday
                        ? <CheckCircle2 size={22} className="text-green-500" />
                        : <Circle size={22} className="text-gray-300 hover:text-green-400" />
                      }
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                        {habit.name}
                      </h3>
                      {doneToday && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          ✓ Completado hoy
                        </span>
                      )}
                      {streak > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flame size={10} /> {streak} días seguidos
                        </span>
                      )}
                    </div>
                    {habit.description && (
                      <p className="text-xs text-gray-500 mb-3">{habit.description}</p>
                    )}

                    {/* Últimos 7 días */}
                    <div className="flex items-center gap-1.5">
                      {last7.map((day) => {
                        const done = habit.completedDates.includes(day.str);
                        const isToday = day.str === today;
                        return (
                          <div key={day.str} className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-400">{day.label}</span>
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                                done
                                  ? `${c.dot} text-white`
                                  : isToday
                                  ? "border-2 border-dashed border-gray-300 text-gray-300"
                                  : "bg-gray-100 text-gray-300"
                              } ${isToday ? "ring-2 ring-offset-1 ring-blue-200" : ""}`}
                            >
                              {done ? "✓" : "·"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(habit)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteHabit(habit)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? "Editar hábito" : "Nuevo hábito"}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!form.name.trim()}>
              {editingHabit ? "Guardar cambios" : "Crear hábito"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Nombre del hábito *</label>
            <input
              type="text"
              placeholder="Ej: Hacer ejercicio, Leer 20 minutos..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Descripción (opcional)</label>
            <input
              type="text"
              placeholder="¿Por qué quieres este hábito?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setForm({ ...form, emoji })}
                  className={`w-9 h-9 rounded-lg text-lg transition-all cursor-pointer ${
                    form.emoji === emoji
                      ? "bg-blue-100 ring-2 ring-blue-400 scale-110"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Color</label>
            <div className="flex gap-2">
              {(Object.keys(colorConfig) as HabitColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 ${colorConfig[color].dot} ${
                    form.color === color ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={!!deleteHabit}
        onClose={() => setDeleteHabit(null)}
        title="Eliminar hábito"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteHabit(null)}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => deleteHabit && handleDelete(deleteHabit)}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-gray-600 text-sm">
            ¿Eliminar el hábito <strong>"{deleteHabit?.name}"</strong> y todo su historial? Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </div>
  );
}
