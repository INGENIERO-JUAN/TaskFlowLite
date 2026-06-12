/**
 * TaskItem.tsx — Fila individual de tarea en la lista del Dashboard.
 * Dark mode completo.
 */
import React from "react";
import {
  CheckCircle2, Calendar, AlertCircle, MessageSquare,
  MoreVertical, Shield, Edit3, Eye, Trash2,
} from "lucide-react";
import { Task, priorityConfig, statusConfig, formatDate, isOverdue } from "../hooks/taskTypes";

interface Props {
  task: Task;
  openMenuId: number | null;
  onToggleStatus: (task: Task) => void;
  onOpenDetail:   (task: Task) => void;
  onEdit:         (task: Task) => void;
  onDeletePrompt: (task: Task) => void;
  onToggleMenu:   (id: number) => void;
  onCloseMenu:    () => void;
}

export function TaskItem({ task, openMenuId, onToggleStatus, onOpenDetail, onEdit, onDeletePrompt, onToggleMenu, onCloseMenu }: Props) {
  const pCfg        = priorityConfig[task.priority];
  const sCfg        = statusConfig[task.status];
  const overdue     = isOverdue(task.dueDate, task.status);
  const hasEvidence = !!task.evidence;
  const comments    = task.comments;

  return (
    <li className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group">
      {/* Checkbox */}
      <button
        onClick={() => { onToggleStatus(task); }}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
          task.status === "completada"
            ? "bg-green-500 border-green-500"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
        }`}
        title={task.status === "completada" ? "Desmarcar" : "Completar (requiere evidencia)"}
      >
        {task.status === "completada" && <CheckCircle2 size={12} className="text-white" />}
      </button>

      {/* Contenido */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { onOpenDetail(task); }}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className={`text-sm font-medium ${task.status === "completada" ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
            {task.title}
          </p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${pCfg.bg} ${pCfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />{pCfg.label}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${sCfg.bg} ${sCfg.color}`}>
            {sCfg.label}
          </span>
          {hasEvidence && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Shield size={10} />Verificada
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{task.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          {task.assignee ? (
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                {task.assignee[0]}
              </div>
              {task.assignee}
            </span>
          ) : (
            <span className="text-gray-300 dark:text-gray-600 italic">Sin asignar</span>
          )}
          <span className={`flex items-center gap-1 ${overdue ? "text-red-500" : ""}`}>
            <Calendar size={11} />{formatDate(task.dueDate)}{overdue && <AlertCircle size={11} />}
          </span>
          {comments.length > 0 && (
            <span className="flex items-center gap-1"><MessageSquare size={11} />{comments.length}</span>
          )}
        </div>
      </div>

      {/* Menú contextual */}
      <div className="relative">
        <button
          onClick={() => { onToggleMenu(task.id); }}
          aria-label="Más opciones de la tarea"
          className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer border-none bg-transparent"
        >
          <MoreVertical size={16} />
        </button>
        {openMenuId === task.id && (
          <>
            <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg z-20 py-1">
              <button onClick={() => { onOpenDetail(task); onCloseMenu(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                <Eye size={14} className="text-gray-400" />Ver detalle
              </button>
              <button onClick={() => { onEdit(task); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                <Edit3 size={14} className="text-gray-400" />Editar
              </button>
              <button onClick={() => { onDeletePrompt(task); onCloseMenu(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer bg-transparent border-none">
                <Trash2 size={14} />Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
