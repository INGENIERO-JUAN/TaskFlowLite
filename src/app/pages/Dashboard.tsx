/**
 * Dashboard Page — Vista protegida (requiere autenticación).
 * Obtiene el usuario autenticado desde AuthContext.
 * Muestra KPIs, lista de tareas y botón de Logout.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  MoreVertical,
  Calendar,
  LogOut,
} from "lucide-react";
import { NavbarAuth } from "../components/NavbarAuth";
import { KPICard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "alta" | "media" | "baja";
type Status = "pendiente" | "en progreso" | "completada";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignee: string;
}

// ─── Config maps ─────────────────────────────────────────────────────────────

const priorityConfig: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string }
> = {
  alta: {
    label: "Alta",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
  media: {
    label: "Media",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    dot: "bg-yellow-500",
  },
  baja: {
    label: "Baja",
    color: "text-green-700",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
};

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-gray-700", bg: "bg-gray-100" },
  "en progreso": {
    label: "En progreso",
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  completada: {
    label: "Completada",
    color: "text-green-700",
    bg: "bg-green-100",
  },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Revisar propuesta de diseño Q2",
    description: "Evaluar mockups y wireframes del nuevo módulo de reportes.",
    priority: "alta",
    status: "en progreso",
    dueDate: "2026-03-15",
    assignee: "Ana García",
  },
  {
    id: 2,
    title: "Reunión de planificación de sprint",
    description: "Definir objetivos y asignar tareas para el próximo sprint.",
    priority: "alta",
    status: "pendiente",
    dueDate: "2026-03-12",
    assignee: "Carlos Méndez",
  },
  {
    id: 3,
    title: "Actualizar documentación de API",
    description: "Documentar endpoints nuevos del módulo de autenticación.",
    priority: "media",
    status: "pendiente",
    dueDate: "2026-03-18",
    assignee: "Laura Torres",
  },
  {
    id: 4,
    title: "Optimizar consultas de base de datos",
    description: "Mejorar rendimiento en consultas lentas del dashboard.",
    priority: "media",
    status: "en progreso",
    dueDate: "2026-03-20",
    assignee: "Miguel Ruiz",
  },
  {
    id: 5,
    title: "Configurar entorno de staging",
    description: "Deploy completo en ambiente de pre-producción.",
    priority: "baja",
    status: "completada",
    dueDate: "2026-03-10",
    assignee: "Ana García",
  },
  {
    id: 6,
    title: "Revisión de código PR #142",
    description: "Code review del módulo de notificaciones push.",
    priority: "media",
    status: "completada",
    dueDate: "2026-03-09",
    assignee: "Carlos Méndez",
  },
  {
    id: 7,
    title: "Diseñar onboarding para nuevos usuarios",
    description: "Crear flujo de bienvenida e introducción al producto.",
    priority: "alta",
    status: "pendiente",
    dueDate: "2026-03-25",
    assignee: "Laura Torres",
  },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "media" as Priority,
  status: "pendiente" as Status,
  dueDate: "",
  assignee: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(dateStr: string, status: Status) {
  if (status === "completada" || !dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── State
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteModalTask, setDeleteModalTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // ── KPIs
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "pendiente").length;
  const inProgressTasks = tasks.filter((t) => t.status === "en progreso").length;
  const completedTasks = tasks.filter((t) => t.status === "completada").length;

  // ── Filtered tasks
  const filteredTasks = tasks.filter((task) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      task.assignee.toLowerCase().includes(q);
    const matchesFilter =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ── Handlers
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignee: task.assignee,
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveTask = () => {
    if (!form.title.trim()) return;
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...form } : t))
      );
    } else {
      setTasks((prev) => [{ id: Date.now(), ...form }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setDeleteModalTask(null);
    setOpenMenuId(null);
  };

  const toggleStatus = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const next: Status =
          t.status === "completada" ? "pendiente" : "completada";
        return { ...t, status: next };
      })
    );
  };

  // ── Greeting
  const firstName = user?.name?.split(" ")[0] ?? "Usuario";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar autenticado (usa AuthContext internamente) */}
      <NavbarAuth />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-gray-900"
              style={{ fontSize: "1.75rem", fontWeight: 800 }}
            >
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Aquí tienes el resumen de tus tareas del equipo.
            </p>
            {user?.company && (
              <span className="inline-flex items-center mt-2 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md" style={{ fontWeight: 500 }}>
                {user.company}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* ── Botón Logout explícito (siempre visible) ── */}
            <Button
              variant="outline"
              size="md"
              icon={<LogOut size={15} />}
              onClick={handleLogout}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Logout
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus size={16} />}
              onClick={openCreateModal}
            >
              Nueva tarea
            </Button>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <KPICard
            title="Total de tareas"
            value={totalTasks}
            icon={<CheckSquare size={18} />}
            color="blue"
            change={`${inProgressTasks} en progreso actualmente`}
            changeType="neutral"
          />
          <KPICard
            title="Tareas pendientes"
            value={pendingTasks}
            icon={<Clock size={18} />}
            color="yellow"
            change={`${Math.round((pendingTasks / totalTasks) * 100)}% del total sin iniciar`}
            changeType="neutral"
          />
          <KPICard
            title="Tareas completadas"
            value={completedTasks}
            icon={<CheckCircle2 size={18} />}
            color="green"
            change={`${Math.round((completedTasks / totalTasks) * 100)}% de progreso total`}
            changeType="up"
          />
        </div>

        {/* ── Progress bar ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
              Progreso del equipo
            </p>
            <p className="text-sm text-blue-600" style={{ fontWeight: 600 }}>
              {Math.round((completedTasks / totalTasks) * 100)}% completado
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
              {pendingTasks} pendientes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {inProgressTasks} en progreso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {completedTasks} completadas
            </span>
          </div>
        </div>

        {/* ── Task list ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* List header: búsqueda + filtros */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar tareas o responsables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400 shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                {(
                  [
                    ["all", "Todas"],
                    ["pendiente", "Pendientes"],
                    ["en progreso", "En progreso"],
                    ["completada", "Completadas"],
                  ] as [typeof filterStatus, string][]
                ).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilterStatus(val)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer border-none ${
                      filterStatus === val
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {filteredTasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <CheckSquare size={40} className="text-gray-300" />
              <p className="text-sm">No se encontraron tareas</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={openCreateModal}
                icon={<Plus size={14} />}
              >
                Crear nueva tarea
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filteredTasks.map((task) => {
                const pCfg = priorityConfig[task.priority];
                const sCfg = statusConfig[task.status];
                const overdue = isOverdue(task.dueDate, task.status);

                return (
                  <li
                    key={task.id}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* Toggle completado */}
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        task.status === "completada"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                      aria-label={
                        task.status === "completada"
                          ? "Marcar como pendiente"
                          : "Marcar como completada"
                      }
                    >
                      {task.status === "completada" && (
                        <CheckCircle2 size={12} className="text-white" />
                      )}
                    </button>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p
                          className={`text-sm ${
                            task.status === "completada"
                              ? "line-through text-gray-400"
                              : "text-gray-900"
                          }`}
                          style={{ fontWeight: 500 }}
                        >
                          {task.title}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${pCfg.bg} ${pCfg.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`}
                          />
                          {pCfg.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${sCfg.bg} ${sCfg.color}`}
                        >
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px]">
                            {task.assignee[0]}
                          </div>
                          {task.assignee}
                        </span>
                        <span
                          className={`flex items-center gap-1 ${
                            overdue ? "text-red-500" : ""
                          }`}
                        >
                          <Calendar size={11} />
                          {formatDate(task.dueDate)}
                          {overdue && <AlertCircle size={11} />}
                        </span>
                      </div>
                    </div>

                    {/* Menú de acciones */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === task.id ? null : task.id
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        aria-label="Opciones"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === task.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                            <button
                              onClick={() => openEditModal(task)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-none"
                            >
                              <Edit3 size={14} className="text-gray-400" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModalTask(task);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer bg-transparent border-none"
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer de la lista */}
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>
              {filteredTasks.length} tarea
              {filteredTasks.length !== 1 ? "s" : ""} mostrada
              {filteredTasks.length !== 1 ? "s" : ""}
            </span>
            <span>
              {completedTasks}/{totalTasks} completadas
            </span>
          </div>
        </div>
      </main>

      {/* ── Modal Crear / Editar ──────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Editar tarea" : "Nueva tarea"}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveTask}
              disabled={!form.title.trim()}
            >
              {editingTask ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Título de la tarea *"
            type="text"
            placeholder="Ej: Revisar diseño del dashboard"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Descripción</label>
            <textarea
              rows={3}
              placeholder="Describe brevemente la tarea..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Prioridad</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-700">Estado</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as Status })
                }
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha límite"
              type="date"
              leftIcon={<Calendar size={15} />}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <Input
              label="Responsable"
              type="text"
              placeholder="Ej: Ana García"
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* ── Modal Confirmación de borrado ─────────────────────────────────── */}
      <Modal
        isOpen={!!deleteModalTask}
        onClose={() => setDeleteModalTask(null)}
        title="Eliminar tarea"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalTask(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                deleteModalTask && handleDeleteTask(deleteModalTask)
              }
            >
              Sí, eliminar
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <div>
            <p
              className="text-gray-800 text-sm"
              style={{ fontWeight: 600 }}
            >
              ¿Estás seguro?
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Vas a eliminar{" "}
              <strong>"{deleteModalTask?.title}"</strong>. Esta acción no se
              puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
