/**
 * Notes Page — Módulo de notas personales.
 * Permite crear, editar, eliminar y buscar notas libres.
 * Persistencia en localStorage por usuario.
 */
import React, { useState, useEffect } from "react";
import { NavbarAuth } from "../components/NavbarAuth";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  StickyNote,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteColor = "yellow" | "blue" | "green" | "pink" | "purple";

interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const colorConfig: Record<NoteColor, { bg: string; border: string; dot: string; label: string }> = {
  yellow: { bg: "bg-yellow-50",  border: "border-yellow-200", dot: "bg-yellow-400", label: "Amarillo" },
  blue:   { bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-400",   label: "Azul"     },
  green:  { bg: "bg-green-50",   border: "border-green-200",  dot: "bg-green-400",  label: "Verde"    },
  pink:   { bg: "bg-pink-50",    border: "border-pink-200",   dot: "bg-pink-400",   label: "Rosa"     },
  purple: { bg: "bg-purple-50",  border: "border-purple-200", dot: "bg-purple-400", label: "Morado"   },
};

const EMPTY_FORM = { title: "", content: "", color: "yellow" as NoteColor };

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days} día${days !== 1 ? "s" : ""}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Notes() {
  const { user } = useAuth();
  const storageKey = `taskflow_notes_${user?.email}`;

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingNote(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, color: note.color });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() && !form.content.trim()) return;
    const now = new Date().toISOString();
    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...form, updatedAt: now }
            : n
        )
      );
    } else {
      setNotes((prev) => [
        { id: Date.now(), ...form, createdAt: now, updatedAt: now },
        ...prev,
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (note: Note) => {
    setNotes((prev) => prev.filter((n) => n.id !== note.id));
    setDeleteNote(null);
  };

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAuth />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-gray-900" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Mis Notas
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {notes.length === 0
                ? "Aún no tienes notas. ¡Crea una!"
                : `${notes.length} nota${notes.length !== 1 ? "s" : ""} guardada${notes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreate}>
            Nueva nota
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <StickyNote size={48} className="text-gray-200 mb-4" />
            <p className="text-sm mb-3">
              {search ? "No hay notas que coincidan" : "Aún no tienes notas"}
            </p>
            {!search && (
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={openCreate}>
                Crear primera nota
              </Button>
            )}
          </div>
        )}

        {/* Grid de notas */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filtered.map((note) => {
            const c = colorConfig[note.color];
            return (
              <div
                key={note.id}
                className={`break-inside-avoid rounded-xl border p-4 group relative transition-shadow hover:shadow-md ${c.bg} ${c.border}`}
              >
                {/* Acciones */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(note)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 text-gray-500 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteNote(note)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 text-gray-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Dot de color */}
                <div className={`w-2.5 h-2.5 rounded-full ${c.dot} mb-3`} />

                {/* Título */}
                {note.title && (
                  <h3 className="text-gray-900 text-sm mb-2" style={{ fontWeight: 600 }}>
                    {note.title}
                  </h3>
                )}

                {/* Contenido */}
                {note.content && (
                  <p className="text-gray-600 text-sm whitespace-pre-wrap" style={{ lineHeight: 1.6 }}>
                    {note.content}
                  </p>
                )}

                {/* Fecha */}
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <Clock size={11} />
                  {formatRelative(note.updatedAt)}
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
        title={editingNote ? "Editar nota" : "Nueva nota"}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!form.title.trim() && !form.content.trim()}
            >
              {editingNote ? "Guardar cambios" : "Crear nota"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Título</label>
            <input
              type="text"
              placeholder="Título de la nota..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Contenido</label>
            <textarea
              rows={5}
              placeholder="Escribe tu nota aquí..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Color</label>
            <div className="flex gap-2">
              {(Object.keys(colorConfig) as NoteColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  title={colorConfig[color].label}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 ${colorConfig[color].dot} ${
                    form.color === color
                      ? "border-gray-800 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={!!deleteNote}
        onClose={() => setDeleteNote(null)}
        title="Eliminar nota"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteNote(null)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={() => deleteNote && handleDelete(deleteNote)}>
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
            ¿Eliminar la nota <strong>"{deleteNote?.title || "sin título"}"</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </div>
  );
}
