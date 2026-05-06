/**
 * Dashboard Page — Vista protegida con Workspaces.
 *
 * Fase 3-4:
 *  - NavbarAuth viene del DashboardLayout (no se repite aquí)
 *  - Dark mode semántico completo
 *  - Skeleton de carga mientras fetchTasks está en progreso
 *  - Toast de error si fallan las tareas al cargar
 *  - Badge y Tooltip integrados como componentes propios
 */
import React, { useState, useEffect } from "react";
import { useNavigate }     from "react-router";
import {
  CheckSquare, Clock, CheckCircle2, Plus, Filter,
  Search, Users, Copy, CheckCheck,
} from "lucide-react";
import { toast }                   from "sonner";
import { KPICard }                 from "../components/ui/Card";
import { Button }                  from "../components/ui/Button";
import { Badge }                   from "../components/ui/Badge";
import { Tooltip }                 from "../components/ui/Tooltip";
import { TaskItem }                from "../components/TaskItem";
import { TaskDetailPanel }         from "../components/TaskDetailPanel";
import { TaskModals }              from "../components/TaskModals";
import { SkeletonDashboard }       from "../components/ui/SkeletonCard";
import { useAuth }                 from "../hooks/useAuth";
import { useTasks }                from "../hooks/useTasks";
import { useRegisteredUsers }      from "../hooks/useRegisteredUsers";

export function Dashboard() {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const registeredUsers = useRegisteredUsers();
  const [codeCopied, setCodeCopied] = useState(false);

  const {
    filteredTasks, form, setForm,
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    isModalOpen, setIsModalOpen,
    editingTask,
    deleteModalTask, setDeleteModalTask,
    openMenuId, setOpenMenuId,
    detailTask, setDetailTask,
    evidenceTask, setEvidenceTask,
    evidenceForm, setEvidenceForm,
    totalTasks, pendingTasks, inProgressTasks, completedTasks,
    openCreateModal, openEditModal,
    handleSaveTask, handleDeleteTask,
    handleToggleStatus, handleConfirmEvidence, handleAddComment,
    tasksLoading, tasksError,
  } = useTasks();

  // Mostrar toast si hay error de carga
  useEffect(() => {
    if (tasksError) {
      toast.error("No se pudieron cargar las tareas desde el servidor. Usando datos locales.");
    }
  }, [tasksError]);

  const handleCopyCode = () => {
    if (!user?.workspaceCode) return;
    navigator.clipboard.writeText(user.workspaceCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  // Skeleton mientras carga inicialmente
  if (tasksLoading && totalTasks === 0) {
    return <SkeletonDashboard />;
  }

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Aquí tienes el resumen de tareas de tu equipo.
          </p>

          {/* Workspace info + código copiable */}
          {user?.workspaceCode && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="primary" dot>
                <Users size={11} className="mr-1" />
                {user.workspaceName}
                {user.isWorkspaceOwner && (
                  <span className="ml-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-1 rounded text-[10px]">
                    Admin
                  </span>
                )}
              </Badge>

              <Tooltip content={codeCopied ? "¡Copiado!" : "Copiar código del workspace"}>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md transition-colors cursor-pointer border-none font-mono tracking-widest">
                  {codeCopied
                    ? <CheckCheck size={12} className="text-green-600" />
                    : <Copy size={12} />}
                  {user.workspaceCode}
                </button>
              </Tooltip>

              {registeredUsers.length > 0 && (
                <Tooltip content={`${registeredUsers.length} miembro${registeredUsers.length !== 1 ? "s" : ""} en este workspace`}>
                  <Badge variant="default">
                    <Users size={11} className="mr-1" />{registeredUsers.length}
                  </Badge>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={openCreateModal}>
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <KPICard
          title="Total de tareas"
          value={totalTasks}
          icon={<CheckSquare size={18} />}
          color="blue"
          change={`${inProgressTasks} en progreso`}
          changeType="neutral"
        />
        <KPICard
          title="Tareas pendientes"
          value={pendingTasks}
          icon={<Clock size={18} />}
          color="yellow"
          change={`${totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}% sin iniciar`}
          changeType="neutral"
        />
        <KPICard
          title="Tareas completadas"
          value={completedTasks}
          icon={<CheckCircle2 size={18} />}
          color="green"
          change={`${progressPct}% de progreso total`}
          changeType="up"
        />
      </div>

      {/* ── Barra de progreso ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm px-6 py-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Progreso del equipo</p>
          <Badge variant={progressPct >= 75 ? "success" : progressPct >= 40 ? "primary" : "warning"}>
            {progressPct}% completado
          </Badge>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
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

      {/* ── Lista de tareas ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">

        {/* Búsqueda + filtros */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tareas o responsables..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {([
                ["all",         "Todas"       ],
                ["pendiente",   "Pendientes"  ],
                ["en progreso", "En progreso" ],
                ["completada",  "Completadas" ],
              ] as [typeof filterStatus, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer border-none ${
                    filterStatus === val
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Indicador de sincronización en background */}
        {tasksLoading && totalTasks > 0 && (
          <div className="px-6 py-2 border-b border-blue-50 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-xs text-blue-600 dark:text-blue-400">Sincronizando con el servidor...</span>
          </div>
        )}

        {/* Filas */}
        {filteredTasks.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
            <CheckSquare size={40} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm">No se encontraron tareas</p>
            <Button variant="secondary" size="sm" onClick={openCreateModal} icon={<Plus size={14} />}>
              Crear nueva tarea
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                openMenuId={openMenuId}
                onToggleStatus={handleToggleStatus}
                onOpenDetail={setDetailTask}
                onEdit={openEditModal}
                onDeletePrompt={task => { setDeleteModalTask(task); setOpenMenuId(null); }}
                onToggleMenu={id => setOpenMenuId(openMenuId === id ? null : id)}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            ))}
          </ul>
        )}

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>
            {filteredTasks.length} tarea{filteredTasks.length !== 1 ? "s" : ""} mostrada{filteredTasks.length !== 1 ? "s" : ""}
          </span>
          <span>{completedTasks}/{totalTasks} completadas</span>
        </div>
      </div>

      {/* ── Panel de detalle lateral ─────────────────────────────────── */}
      {detailTask && (
        <TaskDetailPanel
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={task => { openEditModal(task); setDetailTask(null); }}
          onDelete={task => { setDeleteModalTask(task); setDetailTask(null); }}
          onAddComment={handleAddComment}
        />
      )}

      {/* ── Modales ──────────────────────────────────────────────────── */}
      <TaskModals
        isModalOpen={isModalOpen}
        editingTask={editingTask}
        form={form}
        setForm={setForm}
        onSave={handleSaveTask}
        onCloseModal={() => setIsModalOpen(false)}
        registeredUsers={registeredUsers}
        evidenceTask={evidenceTask}
        evidenceForm={evidenceForm}
        setEvidenceForm={setEvidenceForm}
        onConfirmEvidence={handleConfirmEvidence}
        onCloseEvidence={() => setEvidenceTask(null)}
        deleteModalTask={deleteModalTask}
        onConfirmDelete={handleDeleteTask}
        onCloseDelete={() => setDeleteModalTask(null)}
      />
    </main>
  );
}
