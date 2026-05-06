/**
 * taskTypes.ts — Tipos e interfaces compartidos del módulo de tareas.
 */

export type Priority = "alta" | "media" | "baja";
export type Status   = "pendiente" | "en progreso" | "completada";

export interface Comment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

export interface Evidence {
  note: string;
  imageBase64?: string;
  link?: string;
  completedAt: string;
  completedBy: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  assignee: string;
  comments: Comment[];
  evidence?: Evidence;
}

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  alta:  { label: "Alta",  color: "text-red-700 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-950",       dot: "bg-red-500"    },
  media: { label: "Media", color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950", dot: "bg-yellow-500" },
  baja:  { label: "Baja",  color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950",  dot: "bg-green-500"  },
};

export const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  pendiente:     { label: "Pendiente",   color: "text-gray-700 dark:text-gray-300",  bg: "bg-gray-100 dark:bg-gray-800"  },
  "en progreso": { label: "En progreso", color: "text-blue-700 dark:text-blue-400",  bg: "bg-blue-100 dark:bg-blue-950"  },
  completada:    { label: "Completada",  color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950" },
};

export const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Revisar propuesta de diseño Q2",          description: "Evaluar mockups y wireframes del nuevo módulo de reportes.",   priority: "alta",  status: "en progreso", dueDate: "2026-03-15", assignee: "", comments: [] },
  { id: 2, title: "Reunión de planificación de sprint",      description: "Definir objetivos y asignar tareas para el próximo sprint.",    priority: "alta",  status: "pendiente",   dueDate: "2026-03-12", assignee: "", comments: [] },
  { id: 3, title: "Actualizar documentación de API",         description: "Documentar endpoints nuevos del módulo de autenticación.",      priority: "media", status: "pendiente",   dueDate: "2026-03-18", assignee: "", comments: [] },
  { id: 4, title: "Optimizar consultas de base de datos",    description: "Mejorar rendimiento en consultas lentas del dashboard.",        priority: "media", status: "en progreso", dueDate: "2026-03-20", assignee: "", comments: [] },
  { id: 5, title: "Configurar entorno de staging",           description: "Deploy completo en ambiente de pre-producción.",                priority: "baja",  status: "completada",  dueDate: "2026-03-10", assignee: "", comments: [], evidence: { note: "Deploy exitoso. Todos los servicios respondiendo.", completedAt: new Date().toISOString(), completedBy: "Sistema" } },
  { id: 6, title: "Revisión de código PR #142",              description: "Code review del módulo de notificaciones push.",                priority: "media", status: "completada",  dueDate: "2026-03-09", assignee: "", comments: [], evidence: { note: "PR aprobado. 3 cambios menores resueltos.", completedAt: new Date().toISOString(), completedBy: "Sistema" } },
  { id: 7, title: "Diseñar onboarding para nuevos usuarios", description: "Crear flujo de bienvenida e introducción al producto.",         priority: "alta",  status: "pendiente",   dueDate: "2026-03-25", assignee: "", comments: [] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sanitizeTasks(raw: any[]): Task[] {
  return raw.map(t => ({
    ...t,
    comments: Array.isArray(t.comments) ? t.comments : [],
    evidence: t.evidence ?? undefined,
  }));
}

export function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Ahora";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)} días`;
}

export function isOverdue(d: string, s: Status) {
  if (s === "completada" || !d) return false;
  return new Date(d) < new Date();
}
