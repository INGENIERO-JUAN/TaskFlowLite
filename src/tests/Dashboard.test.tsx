import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../app/lib/axios", () => ({
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock de subcomponentes pesados para aislar la lógica del Dashboard
vi.mock("../app/components/TaskItem", () => ({
  TaskItem: ({ task }: { task: { title: string } }) => (
    <li data-testid="task-item">{task.title}</li>
  ),
}));
vi.mock("../app/components/TaskDetailPanel", () => ({
  TaskDetailPanel: () => <div data-testid="task-detail-panel" />,
}));
vi.mock("../app/components/TaskModals", () => ({
  TaskModals: () => <div data-testid="task-modals" />,
}));

import { Dashboard } from "../app/pages/Dashboard";
import { useAuthStore } from "../app/stores/useAuthStore";
import { useTaskStore } from "../app/stores/useTaskStore";

function loginUser() {
  localStorage.setItem("taskflow_user", JSON.stringify({
    name: "Ana García",
    email: "ana@test.com",
    workspaceCode: "ABC123",
    workspaceName: "Workspace Ana",
    isWorkspaceOwner: true,
  }));
}

describe("Dashboard page", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    useTaskStore.setState({
      tasks: [],
      isLoading: false,
      error: null,
      workspaceCode: null,
      fetchTasks: vi.fn().mockImplementation(() => Promise.resolve()),
    });
  });

  it("muestra el skeleton mientras carga sin tareas", () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({ tasks: [], isLoading: true, error: null, workspaceCode: "ABC123" });
    render(<Dashboard />);
    // El SkeletonDashboard no tiene el saludo
    expect(screen.queryByText(/buenos días|buenas tardes|buenas noches/i)).not.toBeInTheDocument();
  });

  it("muestra el saludo y KPIs con tareas cargadas", () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({
      tasks: [
        { id: 1, title: "Tarea 1", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
        { id: 2, title: "Tarea 2", description: "desc", priority: "media", status: "completada", dueDate: "2026-01-02", assignee: "", comments: [] },
      ],
      isLoading: false, error: null, workspaceCode: "ABC123",
    });
    render(<Dashboard />);
    // Check greeting exists somewhere (Ana appears in multiple elements)
    expect(screen.getAllByText(/Ana/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Total de tareas")).toBeInTheDocument();
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);
  });

  it("muestra el código del workspace y badge de admin", () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({ tasks: [
      { id: 1, title: "Una tarea", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
    ], isLoading: false, error: null, workspaceCode: "ABC123" });
    render(<Dashboard />);
    // The workspace code may be displayed in spans or formatted
    expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("filtra tareas por búsqueda", async () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({
      tasks: [
        { id: 1, title: "Comprar pan", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
        { id: 2, title: "Revisar PR", description: "desc", priority: "media", status: "pendiente", dueDate: "2026-01-02", assignee: "", comments: [] },
      ],
      isLoading: false, error: null, workspaceCode: "ABC123",
    });
    render(<Dashboard />);
    expect(screen.getAllByTestId("task-item")).toHaveLength(2);

    const search = screen.getByPlaceholderText(/buscar tareas/i);
    await userEvent.type(search, "Comprar");
    expect(screen.getAllByTestId("task-item")).toHaveLength(1);
    expect(screen.getByText("Comprar pan")).toBeInTheDocument();
  });

  it("muestra mensaje cuando no hay tareas que coincidan", async () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({
      tasks: [
        { id: 1, title: "Comprar pan", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
      ],
      isLoading: false, error: null, workspaceCode: "ABC123",
    });
    render(<Dashboard />);
    const search = screen.getByPlaceholderText(/buscar tareas/i);
    await userEvent.type(search, "xyzxyz");
    expect(screen.getByText(/no se encontraron tareas/i)).toBeInTheDocument();
  });

  it("filtra tareas por estado", async () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({
      tasks: [
        { id: 1, title: "Pend", description: "d", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
        { id: 2, title: "Done", description: "d", priority: "media", status: "completada", dueDate: "2026-01-02", assignee: "", comments: [] },
      ],
      isLoading: false, error: null, workspaceCode: "ABC123",
    });
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: "Completadas" }));
    // After filter, only the completada task should show
    const items = screen.getAllByTestId("task-item");
    expect(items).toHaveLength(1);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("abre el modal de nueva tarea al hacer click en 'Nueva tarea'", async () => {
    loginUser();
    useAuthStore.setState({
      user: {
        name: "Ana García",
        email: "ana@test.com",
        workspaceCode: "ABC123",
        workspaceName: "Workspace Ana",
        isWorkspaceOwner: true,
      },
      isAuthenticated: true,
      isLoading: false,
    });
    useTaskStore.setState({ tasks: [
      { id: 1, title: "Una tarea", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
    ], isLoading: false, error: null, workspaceCode: "ABC123" });
    render(<Dashboard />);
    await userEvent.click(screen.getByRole("button", { name: /nueva tarea/i }));
    expect(screen.getByTestId("task-modals")).toBeInTheDocument();
  });
});
