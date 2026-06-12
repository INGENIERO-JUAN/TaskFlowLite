/**
 * useTaskStore.test.ts — Suite de pruebas para el store de tareas.
 *
 * Cubre:
 *  - fetchTasks (fallback offline)
 *  - addTask (optimistic update)
 *  - updateTask
 *  - deleteTask
 *  - addComment
 *  - completeTask / revertTask
 *  - reset
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { apiGet, apiPost } from "../app/lib/axios";

vi.mock("../app/lib/axios", () => ({
  apiGet: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPost: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiPut: vi.fn().mockRejectedValue(new Error("Network Error")),
  apiDelete: vi.fn().mockRejectedValue(new Error("Network Error")),
}));

describe("useTaskStore — modo offline", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("fetchTasks carga INITIAL_TASKS cuando localStorage y API están vacíos", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    expect(useTaskStore.getState().tasks.length).toBeGreaterThan(0);
  });

  it("fetchTasks setea workspaceCode correctamente", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS_TEST");
    });
    expect(useTaskStore.getState().workspaceCode).toBe("WS_TEST");
  });

  it("addTask agrega una tarea al store", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    const antes = useTaskStore.getState().tasks.length;
    await act(async () => {
      await useTaskStore.getState().addTask({
        title: "Nueva tarea test",
        description: "Descripción de prueba",
        priority: "alta",
        status: "pendiente",
        dueDate: "2026-12-31",
        assignee: "Tester",
      });
    });
    expect(useTaskStore.getState().tasks.length).toBe(antes + 1);
  });

  it("addTask persiste la tarea en localStorage", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
      await useTaskStore.getState().addTask({
        title: "Tarea persistida",
        description: "Test localStorage",
        priority: "media",
        status: "pendiente",
        dueDate: "2026-12-31",
        assignee: "Ana",
      });
    });
    const raw = localStorage.getItem("tasks_workspace_WS001");
    expect(raw).not.toBeNull();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tasks = JSON.parse(raw!) as { title: string }[];
    expect(tasks.some(t => t.title === "Tarea persistida")).toBe(true);
  });

  it("updateTask modifica los campos de una tarea existente", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    const task = useTaskStore.getState().tasks[0];
    await act(async () => {
      await useTaskStore.getState().updateTask(task.id, { title: "Título modificado" });
    });
    const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(updated?.title).toBe("Título modificado");
  });

  it("deleteTask elimina una tarea del store", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    const task = useTaskStore.getState().tasks[0];
    await act(async () => {
      await useTaskStore.getState().deleteTask(task.id);
    });
    const found = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(found).toBeUndefined();
  });

  it("addComment agrega un comentario a la tarea correcta", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    const task = useTaskStore.getState().tasks[0];
    act(() => {
      useTaskStore.getState().addComment(task.id, { author: "Tester", text: "Comentario de prueba" });
    });
    const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(updated?.comments.some(c => c.text === "Comentario de prueba")).toBe(true);
  });

  it("completeTask cambia el status a 'completada' y guarda evidence", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const task = useTaskStore.getState().tasks.find(t => t.status !== "completada")!;
    const evidence = { note: "Listo", completedAt: new Date().toISOString(), completedBy: "Ana" };
    act(() => {
      useTaskStore.getState().completeTask(task.id, evidence);
    });
    const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(updated?.status).toBe("completada");
    expect(updated?.evidence?.note).toBe("Listo");
  });

  it("revertTask cambia el status a 'pendiente' y elimina evidence", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const task = useTaskStore.getState().tasks.find(t => t.status !== "completada")!;
    act(() => {
      useTaskStore.getState().completeTask(task.id, { note: "ok", completedAt: "", completedBy: "Bot" });
    });
    act(() => {
      useTaskStore.getState().revertTask(task.id);
    });
    const reverted = useTaskStore.getState().tasks.find(t => t.id === task.id);
    expect(reverted?.status).toBe("pendiente");
    expect(reverted?.evidence).toBeUndefined();
  });

  it("reset vacía el store completamente", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS001");
    });
    act(() => {
      useTaskStore.getState().reset();
    });
    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(0);
    expect(state.workspaceCode).toBeNull();
  });

  it("fetchTasks exitoso (online)", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    const mockTasks = [
      { id: 101, title: "Tarea Online 1", description: "desc", priority: "alta", status: "pendiente", dueDate: "2026-01-01", assignee: "", comments: [] },
    ];
    vi.mocked(apiGet).mockResolvedValueOnce(mockTasks);

    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS_ONLINE");
    });

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe("Tarea Online 1");
    expect(state.tasks[0].id).toBe(101);
  });

  it("addTask exitoso (online)", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    vi.mocked(apiGet).mockResolvedValueOnce([]);
    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS_ONLINE_2");
    });

    const mockResponseTask = {
      id: 202,
      title: "Nueva Tarea Servidor",
      description: "Desc",
      priority: "media",
      status: "pendiente",
      dueDate: "2026-02-02",
      assignee: "Online Dev",
      comments: [],
    };
    vi.mocked(apiPost).mockResolvedValueOnce(mockResponseTask);

    await act(async () => {
      await useTaskStore.getState().addTask({
        title: "Nueva Tarea Local",
        description: "Desc",
        priority: "media",
        status: "pendiente",
        dueDate: "2026-02-02",
        assignee: "Online Dev",
      });
    });

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe(202);
    expect(state.tasks[0].title).toBe("Nueva Tarea Servidor");
  });

  it("fetchTasks online falla y cae a error message", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    vi.mocked(apiGet).mockRejectedValueOnce(new Error("Error de base de datos"));

    await act(async () => {
      await useTaskStore.getState().fetchTasks("WS_FAIL");
    });

    const state = useTaskStore.getState();
    expect(state.error).toBe("Error de base de datos");
  });

  it("loadFromStorage maneja JSON corrupto regresando INITIAL_TASKS", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    localStorage.setItem("tasks_workspace_CORRUPT", "invalid-json{");

    await act(async () => {
      await useTaskStore.getState().fetchTasks("CORRUPT");
    });

    const state = useTaskStore.getState();
    expect(state.tasks.length).toBeGreaterThan(0); // Cae a INITIAL_TASKS
  });

  it("acciones usan 'default' workspace si no se ha seteado uno", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    useTaskStore.setState({ workspaceCode: null, tasks: [{ id: 999, title: "Test", description: "", priority: "baja", status: "pendiente", dueDate: "", assignee: "", comments: [] }] });

    await act(async () => {
      await useTaskStore.getState().addTask({
        title: "Tarea sin workspace",
        description: "Desc",
        priority: "baja",
        status: "pendiente",
        dueDate: "2026-01-01",
        assignee: "",
      });
    });

    await act(async () => {
      await useTaskStore.getState().updateTask(999, { title: "Test Modificado" });
    });

    act(() => {
      useTaskStore.getState().addComment(999, { author: "User", text: "Nice" });
      useTaskStore.getState().completeTask(999, { note: "done", completedAt: "", completedBy: "User" });
      useTaskStore.getState().revertTask(999);
    });

    await act(async () => {
      await useTaskStore.getState().deleteTask(999);
    });

    const raw = localStorage.getItem("tasks_workspace_default");
    expect(raw).not.toBeNull();
  });

  it("loadFromStorage maneja errores de localStorage", async () => {
    const { useTaskStore } = await import("../app/stores/useTaskStore");
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
      throw new Error("Localstorage block");
    });

    await act(async () => {
      await useTaskStore.getState().fetchTasks("THROW_STORAGE");
    });

    const state = useTaskStore.getState();
    expect(state.tasks.length).toBeGreaterThan(0);
    spy.mockRestore();
  });
});
