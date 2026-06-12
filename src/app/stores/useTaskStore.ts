/**
 * useTaskStore.ts — Store de tareas con Zustand.
 *
 * Gestiona el estado global de tareas con soporte para:
 *  - Acciones asíncronas (fetch desde API con fallback offline)
 *  - Persistencia automática en localStorage por workspace
 *  - Estados de carga y error
 */

import { create } from "zustand";
import { apiGet, apiPost, apiPut, apiDelete } from "../lib/axios";
import {
  Task, Comment, Evidence, Status, Priority,
  sanitizeTasks, INITIAL_TASKS,
} from "../hooks/taskTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Task, Comment, Evidence, Status, Priority };

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  workspaceCode: string | null;

  /** Carga tareas: primero intenta API, luego localStorage */
  fetchTasks: (workspaceCode: string) => Promise<void>;

  /** Agrega una tarea nueva (API + local) */
  addTask: (task: Omit<Task, "id" | "comments">) => Promise<void>;

  /** Actualiza una tarea existente */
  updateTask: (id: number, changes: Partial<Task>) => Promise<void>;

  /** Elimina una tarea */
  deleteTask: (id: number) => Promise<void>;

  /** Agrega comentario a una tarea */
  addComment: (taskId: number, comment: Omit<Comment, "id" | "createdAt">) => void;

  /** Completa una tarea con evidencia */
  completeTask: (taskId: number, evidence: Evidence) => void;

  /** Revierte una tarea completada a pendiente */
  revertTask: (taskId: number) => void;

  /** Limpia el store (al logout) */
  reset: () => void;
}

// ─── Helpers localStorage ─────────────────────────────────────────────────────

function getStorageKey(code: string) {
  return `tasks_workspace_${code}`;
}

function loadFromStorage(code: string): Task[] {
  try {
    const raw = localStorage.getItem(getStorageKey(code));
    if (!raw) return INITIAL_TASKS;
    return sanitizeTasks(JSON.parse(raw) as Record<string, unknown>[]);
  } catch {
    return INITIAL_TASKS;
  }
}

function saveToStorage(code: string, tasks: Task[]): void {
  localStorage.setItem(getStorageKey(code), JSON.stringify(tasks));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  workspaceCode: null,

  fetchTasks: async (workspaceCode) => {
    set({ isLoading: true, error: null, workspaceCode });
    try {
      const res = await apiGet<Task[]>(`/tasks?workspace=${workspaceCode}`);
      const tasks = sanitizeTasks(res as unknown as Record<string, unknown>[]);
      saveToStorage(workspaceCode, tasks);
      set({ tasks, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar tareas";
      set({ error: msg, isLoading: false, tasks: loadFromStorage(workspaceCode) });
    }
  },

  // ── addTask ────────────────────────────────────────────────────────────────
  addTask: async (taskData) => {
    const workspaceCode = get().workspaceCode ?? "default";
    const tempId = Date.now();
    const newTask: Task = { id: tempId, ...taskData, comments: [] };

    // Optimistic update
    set(s => {
      const tasks = [newTask, ...s.tasks];
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });

    try {
      const created = await apiPost<Task>("/tasks", { ...taskData, workspaceCode });
      // Reemplazar ID temporal con el real del servidor
      set(s => {
        const tasks = s.tasks.map(t =>
          t.id === tempId ? { ...created, comments: created.comments } : t
        );
        saveToStorage(workspaceCode, tasks);
        return { tasks };
      });
    } catch {
      // Si la API falla, mantener el ID local (modo offline)
    }
  },

  // ── updateTask ─────────────────────────────────────────────────────────────
  updateTask: async (id, changes) => {
    const workspaceCode = get().workspaceCode ?? "default";

    set(s => {
      const tasks = s.tasks.map(t => t.id === id ? { ...t, ...changes } : t);
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });

    try {
      await apiPut(`/tasks/${id.toString()}`, changes);
    } catch {
      // Cambio ya aplicado localmente
    }
  },

  // ── deleteTask ─────────────────────────────────────────────────────────────
  deleteTask: async (id) => {
    const workspaceCode = get().workspaceCode ?? "default";

    set(s => {
      const tasks = s.tasks.filter(t => t.id !== id);
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });

    try {
      await apiDelete(`/tasks/${id.toString()}`);
    } catch {
      // Eliminación ya aplicada localmente
    }
  },

  // ── addComment ─────────────────────────────────────────────────────────────
  addComment: (taskId, commentData) => {
    const workspaceCode = get().workspaceCode ?? "default";
    const comment: Comment = {
      id: Date.now(),
      ...commentData,
      createdAt: new Date().toISOString(),
    };
    set(s => {
      const tasks = s.tasks.map(t =>
        t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
      );
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });
  },

  // ── completeTask ───────────────────────────────────────────────────────────
  completeTask: (taskId, evidence) => {
    const workspaceCode = get().workspaceCode ?? "default";
    set(s => {
      const tasks: Task[] = s.tasks.map(t =>
        t.id === taskId ? { ...t, status: "completada", evidence } : t
      );
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });
  },

  // ── revertTask ─────────────────────────────────────────────────────────────
  revertTask: (taskId) => {
    const workspaceCode = get().workspaceCode ?? "default";
    set(s => {
      const tasks: Task[] = s.tasks.map(t =>
        t.id === taskId ? { ...t, status: "pendiente", evidence: undefined } : t
      );
      saveToStorage(workspaceCode, tasks);
      return { tasks };
    });
  },

  // ── reset ──────────────────────────────────────────────────────────────────
  reset: () => { set({ tasks: [], isLoading: false, error: null, workspaceCode: null }); },
}));
