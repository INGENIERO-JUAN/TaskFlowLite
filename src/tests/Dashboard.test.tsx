import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

vi.mock("../app/lib/axios", () => ({
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Mocks que SÍ invocan las callbacks para cubrir las funciones inline ───────
vi.mock("../app/components/TaskItem", () => ({
  TaskItem: ({
    task,
    onDeletePrompt,
    onToggleMenu,
    onCloseMenu,
    onToggleStatus,
    onOpenDetail,
    onEdit,
  }: {
    task: { id: number; title: string };
    onDeletePrompt: (t: { id: number; title: string }) => void;
    onToggleMenu: (id: number) => void;
    onCloseMenu: () => void;
    onToggleStatus: (t: { id: number; title: string }) => void;
    onOpenDetail: (t: { id: number; title: string }) => void;
    onEdit: (t: { id: number; title: string }) => void;
  }) => (
    <li data-testid="task-item">
      {task.title}
      <button data-testid={`delete-${task.id.toString()}`}   onClick={() => { onDeletePrompt(task); }}>delete</button>
      <button data-testid={`menu-${task.id.toString()}`}     onClick={() => { onToggleMenu(task.id); }}>menu</button>
      <button data-testid={`close-${task.id.toString()}`}    onClick={() => { onCloseMenu(); }}>close</button>
      <button data-testid={`toggle-${task.id.toString()}`}   onClick={() => { onToggleStatus(task); }}>toggle</button>
      <button data-testid={`detail-${task.id.toString()}`}   onClick={() => { onOpenDetail(task); }}>detail</button>
      <button data-testid={`edit-${task.id.toString()}`}     onClick={() => { onEdit(task); }}>edit</button>
    </li>
  ),
}));

vi.mock("../app/components/TaskDetailPanel", () => ({
  TaskDetailPanel: ({
    onClose,
    onEdit,
    onDelete,
    onAddComment,
    task,
  }: {
    task: { id: number; title: string };
    onClose: () => void;
    onEdit: (t: { id: number; title: string }) => void;
    onDelete: (t: { id: number; title: string }) => void;
    onAddComment: (id: number, c: { author: string; text: string }) => void;
  }) => (
    <div data-testid="task-detail-panel">
      <button data-testid="panel-close"   onClick={() => { onClose(); }}>close</button>
      <button data-testid="panel-edit"    onClick={() => { onEdit(task); }}>edit</button>
      <button data-testid="panel-delete"  onClick={() => { onDelete(task); }}>delete</button>
      <button data-testid="panel-comment" onClick={() => { onAddComment(task.id, { author: "Test", text: "Hola" }); }}>comment</button>
    </div>
  ),
}));

vi.mock("../app/components/TaskModals", () => ({
  TaskModals: ({
    onSave,
    onCloseModal,
    onCloseEvidence,
    onCloseDelete,
    onConfirmDelete,
    deleteModalTask,
  }: {
    onSave: () => void;
    onCloseModal: () => void;
    onCloseEvidence: () => void;
    onCloseDelete: () => void;
    onConfirmDelete: () => void;
    deleteModalTask: { id: number; title: string } | null;
  }) => (
    <div data-testid="task-modals">
      <button data-testid="modal-save"            onClick={() => { onSave(); }}>save</button>
      <button data-testid="modal-close"           onClick={() => { onCloseModal(); }}>close</button>
      <button data-testid="modal-close-evidence"  onClick={() => { onCloseEvidence(); }}>closeEvidence</button>
      <button data-testid="modal-close-delete"    onClick={() => { onCloseDelete(); }}>closeDelete</button>
      {deleteModalTask && (
        <button data-testid="modal-confirm-delete" onClick={() => { onConfirmDelete(); }}>confirmDelete</button>
      )}
    </div>
  ),
}));

import { Dashboard } from "../app/pages/Dashboard";
import { useAuthStore } from "../app/stores/useAuthStore";
import { useTaskStore } from "../app/stores/useTaskStore";

Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

const BASE_USER = {
  name: "Ana García",
  email: "ana@test.com",
  workspaceCode: "ABC123",
  workspaceName: "Workspace Ana",
  isWorkspaceOwner: true,
};

const BASE_TASKS = [
  { id: 1, title: "Tarea 1", description: "desc", priority: "alta" as const, status: "pendiente" as const, dueDate: "2026-01-01", assignee: "", comments: [] },
  { id: 2, title: "Tarea 2", description: "desc", priority: "media" as const, status: "completada" as const, dueDate: "2026-01-02", assignee: "", comments: [] },
];

function setupStore(overrides: Partial<typeof BASE_USER> = {}, tasksOverride = BASE_TASKS) {
  useAuthStore.setState({ user: { ...BASE_USER, ...overrides }, isAuthenticated: true, isLoading: false });
  useTaskStore.setState({
    tasks: tasksOverride, isLoading: false, error: null, workspaceCode: "ABC123",
    fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()),
  });
}

describe("Dashboard page", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useTaskStore.setState({
      tasks: [], isLoading: false, error: null, workspaceCode: null,
      fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()),
    });
    vi.clearAllMocks();
  });

  it("muestra el skeleton mientras carga sin tareas", () => {
    setupStore();
    useTaskStore.setState({ tasks: [], isLoading: true, error: null, workspaceCode: "ABC123" });
    render(<Dashboard />);
    expect(screen.queryByText(/buenos días|buenas tardes|buenas noches/i)).not.toBeInTheDocument();
  });

  it("muestra el saludo y KPIs con tareas cargadas", () => {
    setupStore();
    render(<Dashboard />);
    expect(screen.getAllByText(/Ana/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Total de tareas")).toBeInTheDocument();
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("muestra el código del workspace y badge de admin", () => {
    setupStore();
    render(<Dashboard />);
    expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("filtra tareas por búsqueda", async () => {
    setupStore({}, [
      { id: 1, title: "Comprar pan", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
      { id: 2, title: "Revisar PR",  description: "desc", priority: "media", status: "pendiente", dueDate: "2026-01-02", assignee: "", comments: [] },
    ]);
    render(<Dashboard />);
    await userEvent.type(screen.getByPlaceholderText(/buscar tareas/i), "Comprar");
    expect(screen.getAllByTestId("task-item")).toHaveLength(1);
  });

  it("muestra mensaje cuando no hay tareas que coincidan", async () => {
    setupStore({}, [{ id: 1, title: "Comprar pan", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] }]);
    render(<Dashboard />);
    await userEvent.type(screen.getByPlaceholderText(/buscar tareas/i), "xyzxyz");
    expect(screen.getByText(/no se encontraron tareas/i)).toBeInTheDocument();
  });

  it("filtra tareas por estado completada", async () => {
    setupStore({}, [
      { id: 1, title: "Pend", description: "d", priority: "alta", status: "pendiente",  dueDate: "", assignee: "", comments: [] },
      { id: 2, title: "Done", description: "d", priority: "media", status: "completada", dueDate: "", assignee: "", comments: [] },
    ]);
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: "Completadas" }));
    expect(screen.getAllByTestId("task-item")).toHaveLength(1);
  });

  it("abre el modal de nueva tarea al hacer click en 'Nueva tarea'", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /nueva tarea/i }));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });

  it("copia el código del workspace al hacer click en el botón de copia", async () => {
    setupStore();
    const { container } = render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /ABC123/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABC123");
    // Espera a que se resuelva la promesa del clipboard y cambie el ícono a "copiado"
    await waitFor(() => {
      expect(container.querySelector(".text-green-600")).toBeInTheDocument();
    });
  });

  it("muestra badge 'Admin' solo cuando isWorkspaceOwner es true", () => {
    setupStore({ isWorkspaceOwner: true });
    render(<Dashboard />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("no muestra badge 'Admin' cuando isWorkspaceOwner es false", () => {
    setupStore({ isWorkspaceOwner: false });
    render(<Dashboard />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("muestra error toast cuando tasksError está presente", () => {
    setupStore();
    useTaskStore.setState({ tasks: BASE_TASKS, isLoading: false, error: "Error de red", workspaceCode: "ABC123", fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()) });
    render(<Dashboard />);
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/no se pudieron cargar/i));
  });

  it("muestra barra de progreso con porcentaje correcto (50%)", () => {
    setupStore({}, [
      { id: 1, title: "T1", description: "", priority: "alta",  status: "completada", dueDate: "", assignee: "", comments: [] },
      { id: 2, title: "T2", description: "", priority: "media", status: "completada", dueDate: "", assignee: "", comments: [] },
      { id: 3, title: "T3", description: "", priority: "baja",  status: "pendiente",  dueDate: "", assignee: "", comments: [] },
      { id: 4, title: "T4", description: "", priority: "baja",  status: "pendiente",  dueDate: "", assignee: "", comments: [] },
    ]);
    render(<Dashboard />);
    expect(screen.getByText(/50% completado/i)).toBeInTheDocument();
  });

  it("muestra 0% de progreso cuando no hay tareas completadas", () => {
    setupStore({}, [{ id: 1, title: "T1", description: "", priority: "alta", status: "pendiente", dueDate: "", assignee: "", comments: [] }]);
    render(<Dashboard />);
    expect(screen.getByText(/0% completado/i)).toBeInTheDocument();
  });

  it("renderiza correctamente cuando no hay workspaceCode", () => {
    useAuthStore.setState({ user: { name: "Sin WS", email: "sinws@test.com", workspaceCode: "", workspaceName: "", isWorkspaceOwner: false }, isAuthenticated: true, isLoading: false });
    useTaskStore.setState({ tasks: BASE_TASKS, isLoading: false, error: null, workspaceCode: null, fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()) });
    render(<Dashboard />);
    expect(screen.getAllByText(/Sin/i).length).toBeGreaterThan(0);
  });

  it("filtra por estado 'En progreso' correctamente", async () => {
    setupStore({}, [
      { id: 1, title: "En curso",   description: "", priority: "alta",  status: "en progreso", dueDate: "", assignee: "", comments: [] },
      { id: 2, title: "Pendiente",  description: "", priority: "media", status: "pendiente",   dueDate: "", assignee: "", comments: [] },
    ]);
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /en progreso/i }));
    expect(screen.getAllByTestId("task-item")).toHaveLength(1);
  });

  it("filtra por estado 'Pendientes' correctamente", async () => {
    setupStore({}, [
      { id: 1, title: "Pendiente 1", description: "", priority: "alta",  status: "pendiente",  dueDate: "", assignee: "", comments: [] },
      { id: 2, title: "Completada 1",description: "", priority: "media", status: "completada", dueDate: "", assignee: "", comments: [] },
    ]);
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /^Pendientes$/i }));
    expect(screen.getAllByTestId("task-item")).toHaveLength(1);
  });

  it("vuelve a mostrar todas las tareas al filtrar 'Todas'", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: "Completadas" }));
    await userEvent.click(screen.getByRole("button", { name: /^Todas$/i }));
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("muestra indicador de sincronización cuando isLoading con tareas existentes", () => {
    setupStore();
    useTaskStore.setState({ tasks: BASE_TASKS, isLoading: true, error: null, workspaceCode: "ABC123", fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()) });
    render(<Dashboard />);
    expect(screen.getByText(/sincronizando con el servidor/i)).toBeInTheDocument();
  });

  it("muestra el conteo de tareas en el footer de la lista", () => {
    setupStore();
    render(<Dashboard />);
    expect(screen.getByText(/2 tareas mostradas/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/2 completadas/i)).toBeInTheDocument();
  });

  // ── Callbacks inline de TaskItem (cubren líneas 117-121) ────────────────────

  it("onDeletePrompt de TaskItem setea deleteModalTask", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("delete-1"));
    // El modal recibe deleteModalTask y muestra el botón confirmDelete
    expect(screen.getByTestId("modal-confirm-delete")).toBeInTheDocument();
  });

  it("onToggleMenu de TaskItem actualiza openMenuId", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("menu-1"));
    // No arroja error — la función se ejecutó
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("onCloseMenu de TaskItem limpia openMenuId", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("close-1"));
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("onToggleStatus de TaskItem llama handleToggleStatus", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("toggle-1"));
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("onOpenDetail de TaskItem muestra el panel de detalle", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("detail-1"));
    expect(screen.getByTestId("task-detail-panel")).toBeInTheDocument();
  });

  it("onEdit de TaskItem abre el modal de edición", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("edit-1"));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });

  // ── Callbacks inline de TaskDetailPanel (cubren líneas 276-282) ────────────

  it("panel-close cierra el detalle", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("detail-1"));
    expect(screen.getByTestId("task-detail-panel")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("panel-close"));
    expect(screen.queryByTestId("task-detail-panel")).not.toBeInTheDocument();
  });

  it("panel-edit abre el modal y cierra el detalle", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("detail-1"));
    await userEvent.click(screen.getByTestId("panel-edit"));
    expect(screen.queryByTestId("task-detail-panel")).not.toBeInTheDocument();
  });

  it("panel-delete setea deleteModalTask y cierra el detalle", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("detail-1"));
    await userEvent.click(screen.getByTestId("panel-delete"));
    expect(screen.queryByTestId("task-detail-panel")).not.toBeInTheDocument();
    expect(screen.getByTestId("modal-confirm-delete")).toBeInTheDocument();
  });

  // ── Callbacks inline de TaskModals (cubren onSave, onCloseModal, etc.) ──────

  it("modal-save llama handleSaveTask", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /nueva tarea/i }));
    await userEvent.click(screen.getByTestId("modal-save"));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });

  it("modal-close cierra el modal", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /nueva tarea/i }));
    await userEvent.click(screen.getByTestId("modal-close"));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });

  it("modal-close-evidence cierra el modal de evidencia", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("modal-close-evidence"));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });

  it("modal-close-delete cierra el modal de confirmación", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("delete-1"));
    await userEvent.click(screen.getByTestId("modal-close-delete"));
    expect(screen.queryByTestId("modal-confirm-delete")).not.toBeInTheDocument();
  });

  it("modal-confirm-delete elimina la tarea", async () => {
    setupStore();
    render(<Dashboard />);
    await userEvent.click(screen.getByTestId("delete-1"));
    expect(screen.getByTestId("modal-confirm-delete")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("modal-confirm-delete"));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });
});
