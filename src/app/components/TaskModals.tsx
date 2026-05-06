/**
 * TaskModals.tsx — Los 3 modales del Dashboard en un solo componente.
 * Dark mode completo.
 */
import React, { useRef } from "react";
import { Shield, Link2, X, Paperclip, Calendar, Trash2, UserCheck } from "lucide-react";
import { Modal }   from "./ui/Modal";
import { Button }  from "./ui/Button";
import { Input }   from "./ui/Input";
import { Task, Priority, Status } from "../hooks/taskTypes";
import { RegisteredUser } from "../hooks/useRegisteredUsers";

interface TaskModalsProps {
  isModalOpen:    boolean;
  editingTask:    Task | null;
  form:           { title: string; description: string; priority: Priority; status: Status; dueDate: string; assignee: string };
  setForm:        (f: any) => void;
  onSave:         () => void;
  onCloseModal:   () => void;
  registeredUsers: RegisteredUser[];

  evidenceTask:   Task | null;
  evidenceForm:   { note: string; imageBase64: string; link: string };
  setEvidenceForm:(f: any) => void;
  onConfirmEvidence: (imageBase64: string) => void;
  onCloseEvidence:   () => void;

  deleteModalTask: Task | null;
  onConfirmDelete: (task: Task) => void;
  onCloseDelete:   () => void;
}

export function TaskModals({
  isModalOpen, editingTask, form, setForm, onSave, onCloseModal, registeredUsers,
  evidenceTask, evidenceForm, setEvidenceForm, onConfirmEvidence, onCloseEvidence,
  deleteModalTask, onConfirmDelete, onCloseDelete,
}: TaskModalsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEvidenceForm((f: any) => ({ ...f, imageBase64: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const selectClass = "border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full";
  const textareaClass = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500";

  return (
    <>
      {/* ── Modal Crear / Editar ── */}
      <Modal isOpen={isModalOpen} onClose={onCloseModal}
        title={editingTask ? "Editar tarea" : "Nueva tarea"} size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onCloseModal}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={!form.title.trim()}>
              {editingTask ? "Guardar cambios" : "Crear tarea"}
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <Input label="Título de la tarea *" type="text" placeholder="Ej: Revisar diseño del dashboard"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea rows={3} placeholder="Describe brevemente la tarea..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className={textareaClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className={selectClass}>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })} className={selectClass}>
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha límite" type="date" leftIcon={<Calendar size={15} />}
              value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <UserCheck size={13} className="text-gray-400" />Responsable
              </label>
              {registeredUsers.length === 0
                ? <div className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-800">Solo tú en este workspace</div>
                : <select value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className={selectClass}>
                    <option value="">— Sin asignar —</option>
                    {registeredUsers.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                  </select>
              }
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Modal Evidencia ── */}
      <Modal isOpen={!!evidenceTask} onClose={onCloseEvidence} title="Completar tarea con evidencia" size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onCloseEvidence}>Cancelar</Button>
            <Button variant="primary" size="sm" icon={<Shield size={14} />}
              onClick={() => onConfirmEvidence(evidenceForm.imageBase64)}
              disabled={!evidenceForm.note.trim()}>
              Marcar como completada
            </Button>
          </>
        }>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
            <Shield size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">Para completar esta tarea debes dejar una nota de cierre. Opcionalmente puedes adjuntar una captura o un enlace.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nota de cierre <span className="text-red-500">*</span>
            </label>
            <textarea rows={3} placeholder="¿Cómo lo resolviste? ¿Qué resultado obtuviste?..."
              value={evidenceForm.note} onChange={e => setEvidenceForm((f: any) => ({ ...f, note: e.target.value }))}
              className={textareaClass} />
          </div>
          <Input label="Enlace de evidencia (opcional)" type="url" placeholder="https://github.com/pr/123"
            leftIcon={<Link2 size={15} />} value={evidenceForm.link}
            onChange={e => setEvidenceForm((f: any) => ({ ...f, link: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Captura de pantalla (opcional)</label>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} className="hidden" />
            {evidenceForm.imageBase64
              ? <div className="relative">
                  <img src={evidenceForm.imageBase64} alt="preview" className="w-full rounded-lg border border-gray-200 dark:border-gray-700 object-cover max-h-36" />
                  <button onClick={() => setEvidenceForm((f: any) => ({ ...f, imageBase64: "" }))}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer border-none transition-colors">
                    <X size={12} />
                  </button>
                </div>
              : <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg py-4 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer bg-transparent">
                  <Paperclip size={16} />Adjuntar imagen
                </button>
            }
          </div>
        </div>
      </Modal>

      {/* ── Modal Eliminar ── */}
      <Modal isOpen={!!deleteModalTask} onClose={onCloseDelete} title="Eliminar tarea" size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={onCloseDelete}>Cancelar</Button>
            <Button variant="danger" size="sm" onClick={() => deleteModalTask && onConfirmDelete(deleteModalTask)}>
              Sí, eliminar
            </Button>
          </>
        }>
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <div>
            <p className="text-gray-800 dark:text-gray-200 text-sm font-semibold">¿Estás seguro?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Vas a eliminar <strong>"{deleteModalTask?.title}"</strong>. Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
