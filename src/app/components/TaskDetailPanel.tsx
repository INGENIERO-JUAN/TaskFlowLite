/**
 * TaskDetailPanel.tsx — Panel lateral de detalle de tarea.
 * Dark mode completo.
 */
import React, { useState } from "react";
import { X, Shield, Link2, Edit3, Trash2, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Task, priorityConfig, statusConfig, formatDate, timeAgo, isOverdue } from "../hooks/taskTypes";

interface Props {
  task: Task;
  onClose:      () => void;
  onEdit:       (task: Task) => void;
  onDelete:     (task: Task) => void;
  onAddComment: (taskId: number, text: string) => void;
}

export function TaskDetailPanel({ task, onClose, onEdit, onDelete, onAddComment }: Props) {
  const [comment, setComment] = useState("");

  const handleSend = () => {
    if (!comment.trim()) return;
    onAddComment(task.id, comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 dark:bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 pr-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Detalle de tarea</p>
            <h2 className="text-gray-900 dark:text-white text-base font-bold">{task.title}</h2>
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-1.5 cursor-pointer border-none bg-transparent transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority].dot}`} />
              {priorityConfig[task.priority].label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs ${statusConfig[task.status].bg} ${statusConfig[task.status].color}`}>
              {statusConfig[task.status].label}
            </span>
            {task.evidence && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <Shield size={10} />Verificada
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 text-sm">
            {task.description && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Descripción</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{task.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Responsable</p>
                {task.assignee
                  ? <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-[10px] font-semibold">{task.assignee[0]}</div>
                      <span className="text-gray-700 dark:text-gray-300">{task.assignee}</span>
                    </div>
                  : <span className="text-gray-400 dark:text-gray-500 italic text-xs">Sin asignar</span>
                }
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Fecha límite</p>
                <p className={isOverdue(task.dueDate, task.status) ? "text-red-500" : "text-gray-700 dark:text-gray-300"}>
                  {formatDate(task.dueDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Evidencia */}
          {task.evidence && (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={15} className="text-emerald-600" />
                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-semibold">Evidencia de completado</p>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-2 leading-relaxed">{task.evidence.note}</p>
              {task.evidence.link && (
                <a href={task.evidence.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                  <Link2 size={11} />{task.evidence.link}
                </a>
              )}
              {task.evidence.imageBase64 && (
                <img src={task.evidence.imageBase64} alt="Evidencia"
                  className="w-full rounded-lg border border-emerald-200 dark:border-emerald-800 mt-2 object-cover max-h-40" />
              )}
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Completada por <strong>{task.evidence.completedBy}</strong> · {timeAgo(task.evidence.completedAt)}
              </p>
            </div>
          )}

          {/* Comentarios */}
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold mb-3">
              Comentarios{" "}
              {task.comments.length > 0 && (
                <span className="text-gray-400 font-normal">({task.comments.length})</span>
              )}
            </p>
            {task.comments.length === 0
              ? <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sé el primero en comentar...</p>
              : <div className="flex flex-col gap-3 mb-3">
                  {task.comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs shrink-0 font-semibold">{c.author[0]}</div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-700 dark:text-gray-200 font-semibold">{c.author}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
            }
            <div className="flex gap-2 mt-3">
              <input type="text" placeholder="Escribe un comentario..." value={comment}
                onChange={e => { setComment(e.target.value); }}
                onKeyDown={e => { if (e.key === "Enter") { handleSend(); } }}
                className="flex-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400" />
              <button onClick={handleSend} disabled={!comment.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-40 cursor-pointer transition-colors border-none">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <Button variant="outline" size="sm" icon={<Edit3 size={14} />}
            onClick={() => { onEdit(task); onClose(); }} className="flex-1">
            Editar
          </Button>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />}
            onClick={() => { onDelete(task); onClose(); }}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
