/**
 * Reports Page — Reportes y análisis de productividad.
 * Dark mode completo + NavbarAuth eliminada (viene del DashboardLayout).
 */
import React, { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";
import {
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  Users, BarChart3, Target,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

type Priority = "alta" | "media" | "baja";
type Status   = "pendiente" | "en progreso" | "completada";

interface Task {
  id: number; title: string; description: string;
  priority: Priority; status: Status; dueDate: string; assignee: string;
}

const STATUS_COLORS: Record<Status, string> = {
  pendiente: "#94a3b8", "en progreso": "#3b82f6", completada: "#22c55e",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow-md">
      {label && <p className="text-gray-500 dark:text-gray-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-gray-900 dark:text-white font-medium">{payload[0].name}: {payload[0].value} tarea{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

export function Reports() {
  const { user } = useAuth();
  const storageKey = `tasks_workspace_${user?.workspaceCode ?? "default"}`;

  const tasks = useMemo<Task[]>(() => {
    try { const raw = localStorage.getItem(storageKey); return raw ? JSON.parse(raw) : []; } catch { return []; }
  }, [storageKey]);

  const statusData = useMemo(() => {
    const counts = { pendiente: 0, "en progreso": 0, completada: 0 } as Record<Status, number>;
    tasks.forEach(t => counts[t.status]++);
    return [
      { name: "Pendientes",  value: counts["pendiente"],   color: STATUS_COLORS["pendiente"]   },
      { name: "En progreso", value: counts["en progreso"], color: STATUS_COLORS["en progreso"] },
      { name: "Completadas", value: counts["completada"],  color: STATUS_COLORS["completada"]  },
    ].filter(d => d.value > 0);
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = { alta: 0, media: 0, baja: 0 } as Record<Priority, number>;
    tasks.forEach(t => counts[t.priority]++);
    return [
      { name: "Alta",  total: counts.alta,  completadas: tasks.filter(t => t.priority === "alta"  && t.status === "completada").length },
      { name: "Media", total: counts.media, completadas: tasks.filter(t => t.priority === "media" && t.status === "completada").length },
      { name: "Baja",  total: counts.baja,  completadas: tasks.filter(t => t.priority === "baja"  && t.status === "completada").length },
    ];
  }, [tasks]);

  const assigneeData = useMemo(() => {
    const map: Record<string, { total: number; completadas: number }> = {};
    tasks.forEach(t => {
      if (!t.assignee) return;
      if (!map[t.assignee]) map[t.assignee] = { total: 0, completadas: 0 };
      map[t.assignee].total++;
      if (t.status === "completada") map[t.assignee].completadas++;
    });
    return Object.entries(map).map(([name, d]) => ({ name, total: d.total, completadas: d.completadas, rate: Math.round((d.completadas / d.total) * 100) }))
      .sort((a, b) => b.total - a.total).slice(0, 6);
  }, [tasks]);

  const overdueTasks = useMemo(() => tasks.filter(t => { if (t.status === "completada" || !t.dueDate) return false; return new Date(t.dueDate) < new Date(); }), [tasks]);

  const total       = tasks.length;
  const completadas = tasks.filter(t => t.status === "completada").length;
  const enProgreso  = tasks.filter(t => t.status === "en progreso").length;
  const tasa        = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const activityData = useMemo(() => {
    const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
    const perWeek = Math.floor(completadas / 4);
    const remainder = completadas % 4;
    return weeks.map((w, i) => ({ semana: w, completadas: perWeek + (i === 3 ? remainder : 0) }));
  }, [completadas]);

  const cardClass = "bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>Reportes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Análisis de productividad — {total} tarea{total !== 1 ? "s" : ""}
          {user?.workspaceName && <span className="text-blue-600"> · {user.workspaceName}</span>}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total tareas",  value: total,       icon: <BarChart3 size={16} />,    color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-950"   },
          { label: "Completadas",   value: completadas, icon: <CheckCircle2 size={16} />, color: "#22c55e", bg: "bg-green-50 dark:bg-green-950"  },
          { label: "En progreso",   value: enProgreso,  icon: <Clock size={16} />,        color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950"  },
          { label: "Tasa de éxito", value: `${tasa}%`,  icon: <Target size={16} />,       color: "#8b5cf6", bg: "bg-purple-50 dark:bg-purple-950"},
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.bg}`} style={{ color: kpi.color }}>{kpi.icon}</div>
            </div>
            <p className="text-2xl" style={{ fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Fila 1: Dona + Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center"><Target size={15} className="text-blue-600" /></div>
            <h2 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Distribución por estado</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-9">Cómo están distribuidas tus tareas</p>
          {statusData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400"><BarChart3 size={32} className="text-gray-300 mb-2" /><p className="text-sm">Sin datos aún</p></div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3 shrink-0">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{d.name}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white ml-auto pl-3">{d.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400">Tasa completado</p>
                  <p className="text-lg font-bold" style={{ color: "#22c55e" }}>{tasa}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center"><AlertCircle size={15} className="text-amber-600" /></div>
            <h2 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Tareas por prioridad</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-9">Total vs completadas por nivel</p>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400"><BarChart3 size={32} className="text-gray-300 mb-2" /><p className="text-sm">Sin datos aún</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" radius={[4,4,0,0]}>{priorityData.map((_, i) => <Cell key={i} fill={["#fca5a5","#fcd34d","#86efac"][i]} />)}</Bar>
                <Bar dataKey="completadas" name="Completadas" radius={[4,4,0,0]}>{priorityData.map((_, i) => <Cell key={i} fill={["#ef4444","#f59e0b","#22c55e"][i]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fila 2: Línea + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center"><TrendingUp size={15} className="text-green-600" /></div>
            <h2 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Actividad reciente</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-9">Tareas completadas por semana</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="completadas" name="Completadas" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center"><Users size={15} className="text-purple-600" /></div>
            <h2 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Ranking de responsables</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4 ml-9">Tareas asignadas y completadas</p>
          {assigneeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400"><Users size={32} className="text-gray-300 mb-2" /><p className="text-sm">Sin responsables asignados</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {assigneeData.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 dark:bg-gray-800 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`} style={{ fontWeight: 600 }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 text-xs shrink-0" style={{ fontWeight: 600 }}>{a.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-800 dark:text-gray-200 truncate" style={{ fontWeight: 500 }}>{a.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{a.completadas}/{a.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${a.rate}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 w-8 text-right">{a.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tareas vencidas */}
      {overdueTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center"><AlertCircle size={15} className="text-red-500" /></div>
            <h2 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>
              Tareas vencidas <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 text-xs rounded-full">{overdueTasks.length}</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {overdueTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 bg-red-50 dark:bg-red-950/40 rounded-lg">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate" style={{ fontWeight: 500 }}>{t.title}</span>
                <span className="text-xs text-red-500 shrink-0">{new Date(t.dueDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${t.priority === "alta" ? "bg-red-100 text-red-700" : t.priority === "media" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-16 text-center">
          <BarChart3 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aún no hay tareas en este workspace.</p>
          <p className="text-gray-400 text-xs mt-1">Crea tareas en el Dashboard para ver tus reportes aquí.</p>
        </div>
      )}
    </main>
  );
}
