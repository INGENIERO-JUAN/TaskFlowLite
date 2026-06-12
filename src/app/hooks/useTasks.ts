/**
 * useTasks.ts — Hook de UI para el dashboard.
 *
 * Conecta el useTaskStore (Zustand) con el estado local de UI
 * (modales, filtros, búsqueda, panel de detalle, etc.).
 *
 * La lógica de datos (CRUD, API, persistencia) vive en useTaskStore.
 * Este hook solo orquesta la UI del Dashboard.
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { useTaskStore } from "../stores/useTaskStore";
import type { Task, Comment, Evidence, Status, Priority } from "./taskTypes";

export type { Task, Comment, Evidence, Status, Priority };

const EMPTY_FORM     = { title: "", description: "", priority: "media" as Priority, status: "pendiente" as Status, dueDate: "", assignee: "" };
const EMPTY_EVIDENCE = { note: "", imageBase64: "", link: "" };

export function useTasks() {
  const { user } = useAuth();
  const workspaceCode = user?.workspaceCode ?? "default";

  // ── Store de Zustand ───────────────────────────────────────────────────────
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    completeTask,
    revertTask,
  } = useTaskStore();

  // ── Estado local de UI ─────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterStatus,    setFilterStatus]    = useState<"all" | Status>("all");
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [editingTask,     setEditingTask]     = useState<Task | null>(null);
  const [deleteModalTask, setDeleteModalTask] = useState<Task | null>(null);
  const [openMenuId,      setOpenMenuId]      = useState<number | null>(null);
  const [form,            setForm]            = useState({ ...EMPTY_FORM });
  const [detailTask,      setDetailTask]      = useState<Task | null>(null);
  const [newComment,      setNewComment]      = useState("");
  const [evidenceTask,    setEvidenceTask]    = useState<Task | null>(null);
  const [evidenceForm,    setEvidenceForm]    = useState({ ...EMPTY_EVIDENCE });

  // Ref para acceder a detailTask dentro del effect sin añadirlo como dep
  const detailTaskRef = useRef(detailTask);
  detailTaskRef.current = detailTask;

  // ── Cargar tareas al montar / cambiar workspace ────────────────────────────
  useEffect(() => {
    if (workspaceCode) void fetchTasks(workspaceCode);
  }, [workspaceCode, fetchTasks]);

  // ── Mantener detailTask sincronizado con store ─────────────────────────────
  useEffect(() => {
    const current = detailTaskRef.current;
    if (current) {
      const updated = tasks.find(t => t.id === current.id);
      if (updated) setDetailTask(updated);
    }
  }, [tasks]);

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalTasks      = tasks.length;
  const pendingTasks    = tasks.filter(t => t.status === "pendiente").length;
  const inProgressTasks = tasks.filter(t => t.status === "en progreso").length;
  const completedTasks  = tasks.filter(t => t.status === "completada").length;

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const filteredTasks = tasks.filter(task => {
    const q  = searchQuery.toLowerCase();
    const ms = task.title.toLowerCase().includes(q)
            || task.description.toLowerCase().includes(q)
            || task.assignee.toLowerCase().includes(q);
    const mf = filterStatus === "all" || task.status === filterStatus;
    return ms && mf;
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingTask(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title:       task.title,
      description: task.description,
      priority:    task.priority,
      status:      task.status,
      dueDate:     task.dueDate,
      assignee:    task.assignee,
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveTask = async () => {
    if (!form.title.trim()) return;
    if (editingTask) {
      await updateTask(editingTask.id, form);
    } else {
      await addTask(form);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (task: Task) => {
    await deleteTask(task.id);
    setDeleteModalTask(null);
    setOpenMenuId(null);
    if (detailTask?.id === task.id) setDetailTask(null);
  };

  const handleToggleStatus = (task: Task) => {
    if (task.status === "completada") {
      revertTask(task.id);
    } else {
      setEvidenceTask(task);
      setEvidenceForm({ ...EMPTY_EVIDENCE });
    }
  };

  const handleConfirmEvidence = (imageBase64: string) => {
    if (!evidenceTask || !evidenceForm.note.trim()) return;
    const evidence: Evidence = {
      note:        evidenceForm.note,
      imageBase64: imageBase64 || undefined,
      link:        evidenceForm.link || undefined,
      completedAt: new Date().toISOString(),
      completedBy: user?.name ?? "Usuario",
    };
    completeTask(evidenceTask.id, evidence);
    setEvidenceTask(null);
  };

  const handleAddComment = (taskId: number, text: string) => {
    if (!text.trim()) return;
    addComment(taskId, {
      author: user?.name ?? "Usuario",
      text:   text.trim(),
    });
  };

  return {
    // Estado
    tasks, filteredTasks, form, setForm,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    isModalOpen, setIsModalOpen,
    editingTask,
    deleteModalTask, setDeleteModalTask,
    openMenuId, setOpenMenuId,
    detailTask, setDetailTask,
    newComment, setNewComment,
    evidenceTask, setEvidenceTask,
    evidenceForm, setEvidenceForm,
    tasksLoading, tasksError,
    // KPIs
    totalTasks, pendingTasks, inProgressTasks, completedTasks,
    // Handlers
    openCreateModal, openEditModal,
    handleSaveTask, handleDeleteTask,
    handleToggleStatus, handleConfirmEvidence, handleAddComment,
  };
}
