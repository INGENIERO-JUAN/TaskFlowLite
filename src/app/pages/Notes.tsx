/**
 * Notes Page — Módulo de notas personales.
 * Crear, editar, eliminar y buscar notas con color de etiqueta.
 * Dark mode completo + NavbarAuth eliminada (viene del DashboardLayout).
 */
import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, StickyNote, Info } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input }  from "../components/ui/input";
import { Modal }  from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
}

type NoteColor = "yellow" | "blue" | "green" | "pink" | "purple" | "orange";

const colorConfig: Record<NoteColor, {
  bg: string; border: string; dot: string; text: string;
  darkBg: string; darkBorder: string;
  label: string; meaning: string; emoji: string;
}> = {
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-400", text: "text-yellow-800", darkBg: "dark:bg-yellow-950/40", darkBorder: "dark:border-yellow-800", label: "Amarillo", meaning: "Ideas y pendientes rápidos",  emoji: "💡" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-400",   text: "text-blue-800",   darkBg: "dark:bg-blue-950/40",   darkBorder: "dark:border-blue-800",   label: "Azul",     meaning: "Reuniones y decisiones",       emoji: "📋" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  dot: "bg-green-400",  text: "text-green-800",  darkBg: "dark:bg-green-950/40",  darkBorder: "dark:border-green-800",  label: "Verde",    meaning: "Logros y aprendizajes",         emoji: "✅" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   dot: "bg-pink-400",   text: "text-pink-800",   darkBg: "dark:bg-pink-950/40",   darkBorder: "dark:border-pink-800",   label: "Rosa",     meaning: "Personal y metas",              emoji: "🎯" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-400", text: "text-purple-800", darkBg: "dark:bg-purple-950/40", darkBorder: "dark:border-purple-800", label: "Morado",   meaning: "Técnico y código",              emoji: "💻" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-400", text: "text-orange-800", darkBg: "dark:bg-orange-950/40", darkBorder: "dark:border-orange-800", label: "Naranja",  meaning: "Urgente o importante",          emoji: "🚨" },
};

const COLORS: NoteColor[] = ["yellow", "blue", "green", "pink", "purple", "orange"];
const EMPTY_FORM = { title: "", content: "", color: "yellow" as NoteColor };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "Ahora mismo";
  if (mins < 60)  return `Hace ${mins.toString()} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Hace ${hrs.toString()}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days.toString()} día${days !== 1 ? "s" : ""}`;
}

export function Notes() {
  const { user } = useAuth();
  const storageKey = `notes_${user?.email ?? "guest"}`;

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) as Note[] : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch]           = useState("");
  const [filterColor, setFilterColor] = useState<NoteColor | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote]   = useState<Note | null>(null);
  const [showLegend, setShowLegend]   = useState(false);
  const [form, setForm]               = useState({ ...EMPTY_FORM });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    return (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
        && (filterColor === "all" || n.color === filterColor);
  });

  const openCreate = () => { setEditingNote(null); setForm({ ...EMPTY_FORM }); setIsModalOpen(true); };
  const openEdit   = (note: Note) => { setEditingNote(note); setForm({ title: note.title, content: note.content, color: note.color }); setIsModalOpen(true); };

  const handleSave = () => {
    if (!form.title.trim() && !form.content.trim()) return;
    const now = new Date().toISOString();
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...form, updatedAt: now } : n));
    } else {
      setNotes(prev => [{ id: Date.now(), ...form, createdAt: now, updatedAt: now }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (note: Note) => {
    setNotes(prev => prev.filter(n => n.id !== note.id));
    setDeleteNote(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>Mis Notas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {notes.length} nota{notes.length !== 1 ? "s" : ""} guardada{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowLegend(!showLegend); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${
              showLegend ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
            <Info size={14} />Guía de colores
          </button>
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreate}>
            Nueva nota
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3" style={{ fontWeight: 500 }}>Significado de cada color:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {COLORS.map(c => {
              const cfg = colorConfig[c];
              return (
                <div key={c} className={`rounded-lg border px-3 py-2.5 ${cfg.bg} ${cfg.border} ${cfg.darkBg} ${cfg.darkBorder}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
                    <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <p className={`text-xs ${cfg.text} opacity-80`} style={{ lineHeight: 1.4 }}>{cfg.meaning}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar notas..." value={search} onChange={e => { setSearch(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { setFilterColor("all"); }}
            className={`px-3 py-1.5 rounded-md text-xs border-none cursor-pointer transition-colors ${filterColor === "all" ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            Todas
          </button>
          {COLORS.map(c => {
            const cfg = colorConfig[c];
            return (
              <button key={c} onClick={() => { setFilterColor(filterColor === c ? "all" : c); }}
                title={`${cfg.label} — ${cfg.meaning}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border-none cursor-pointer transition-all ${cfg.bg} ${cfg.darkBg} ${filterColor === c ? "ring-2 ring-offset-1 opacity-100" : "opacity-70 hover:opacity-100"}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={cfg.text}>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de notas */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-gray-400">
          <StickyNote size={48} className="text-gray-300 dark:text-gray-600" />
          <p className="text-sm">{search || filterColor !== "all" ? "No hay notas que coincidan" : "Aún no tienes notas"}</p>
          {!search && filterColor === "all" && (
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={openCreate}>Crear primera nota</Button>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filtered.map(note => {
            const cfg = colorConfig[note.color];
            return (
              <div key={note.id}
                className={`break-inside-avoid rounded-xl border p-4 group relative transition-shadow hover:shadow-md ${cfg.bg} ${cfg.border} ${cfg.darkBg} ${cfg.darkBorder}`}>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { openEdit(note); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => { setDeleteNote(note); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-gray-900/80 hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-500 cursor-pointer transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs ${cfg.text} opacity-70`}>{cfg.emoji} {cfg.meaning}</span>
                </div>
                {note.title && <h3 className="text-gray-900 dark:text-white text-sm mb-2" style={{ fontWeight: 600 }}>{note.title}</h3>}
                {note.content && <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>{note.content}</p>}
                <p className="text-xs text-gray-400 mt-3">{timeAgo(note.updatedAt)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); }}
        title={editingNote ? "Editar nota" : "Nueva nota"} size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setIsModalOpen(false); }}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!form.title.trim() && !form.content.trim()}>
              {editingNote ? "Guardar cambios" : "Crear nota"}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <Input label="Título (opcional)" type="text" placeholder="Título de la nota..."
            value={form.title} onChange={e => { setForm({ ...form, title: e.target.value }); }} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700 dark:text-gray-300">Contenido</label>
            <textarea rows={5} placeholder="Escribe tu nota aquí..."
              value={form.content} onChange={e => { setForm({ ...form, content: e.target.value }); }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Color y categoría</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLORS.map(c => {
                const cfg = colorConfig[c];
                return (
                  <button key={c} onClick={() => { setForm({ ...form, color: c }); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-left ${cfg.bg} ${cfg.darkBg} ${form.color === c ? `${cfg.border} ${cfg.darkBorder} ring-2` : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"}`}>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${cfg.dot}`} />
                    <div>
                      <p className={`text-xs font-medium ${cfg.text}`}>{cfg.emoji} {cfg.label}</p>
                      <p className={`text-xs ${cfg.text} opacity-70`} style={{ lineHeight: 1.3 }}>{cfg.meaning}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!deleteNote} onClose={() => { setDeleteNote(null); }} title="Eliminar nota" size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteNote(null); }}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => { if (deleteNote) handleDelete(deleteNote); }}>Sí, eliminar</Button>
          </>
        }>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            ¿Eliminar la nota <strong>&ldquo;{deleteNote?.title ?? "sin título"}&rdquo;</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </main>
  );
}
