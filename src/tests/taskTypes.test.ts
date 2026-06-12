/**
 * taskTypes.test.ts — Suite de pruebas para helpers de tareas.
 *
 * Cubre:
 *  - sanitizeTasks: normalización de datos crudos
 *  - formatDate: formato de fecha legible
 *  - timeAgo: tiempo relativo
 *  - isOverdue: detección de tareas vencidas
 *  - INITIAL_TASKS: estructura válida
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sanitizeTasks,
  formatDate,
  timeAgo,
  isOverdue,
  INITIAL_TASKS,
  type Task,
} from "../app/hooks/taskTypes";

describe("sanitizeTasks", () => {
  it("preserva tareas con comments ya definidos", () => {
    const raw = [{ id: 1, title: "T", comments: [{ id: 1, author: "A", text: "X", createdAt: "" }] }];
    const result = sanitizeTasks(raw);
    expect(result[0].comments).toHaveLength(1);
  });

  it("rellena con [] cuando comments es undefined", () => {
    const raw = [{ id: 2, title: "T" }];
    const result = sanitizeTasks(raw);
    expect(result[0].comments).toEqual([]);
  });

  it("preserva evidence cuando existe", () => {
    const evidence = { note: "ok", completedAt: "", completedBy: "Ana" };
    const raw = [{ id: 3, title: "T", evidence }];
    const result = sanitizeTasks(raw);
    expect(result[0].evidence).toEqual(evidence);
  });

  it("devuelve evidence undefined cuando no existe en raw", () => {
    const raw = [{ id: 4, title: "T" }];
    const result = sanitizeTasks(raw);
    expect(result[0].evidence).toBeUndefined();
  });
});

describe("formatDate", () => {
  it("devuelve '—' para string vacío", () => {
    expect(formatDate("")).toBe("—");
  });

  it("formatea una fecha válida como string legible", () => {
    const result = formatDate("2026-06-13");
    expect(result).toMatch(/jun/i);
    expect(result).toMatch(/2026/);
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve 'Ahora' para diferencia < 1 minuto", () => {
    const iso = new Date("2026-06-11T11:59:30Z").toISOString();
    expect(timeAgo(iso)).toBe("Ahora");
  });

  it("devuelve 'Hace X min' para diferencia en minutos", () => {
    const iso = new Date("2026-06-11T11:55:00Z").toISOString();
    expect(timeAgo(iso)).toMatch(/Hace \d+ min/);
  });

  it("devuelve 'Hace Xh' para diferencia en horas", () => {
    const iso = new Date("2026-06-11T09:00:00Z").toISOString();
    expect(timeAgo(iso)).toMatch(/Hace \d+h/);
  });

  it("devuelve 'Hace X días' para diferencia > 24h", () => {
    const iso = new Date("2026-06-09T12:00:00Z").toISOString();
    expect(timeAgo(iso)).toMatch(/Hace \d+ días/);
  });
});

describe("isOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve false para tareas completadas aunque estén vencidas", () => {
    expect(isOverdue("2026-01-01", "completada")).toBe(false);
  });

  it("devuelve false cuando la fecha es futura", () => {
    expect(isOverdue("2027-01-01", "pendiente")).toBe(false);
  });

  it("devuelve true cuando la fecha ya pasó y la tarea no está completada", () => {
    expect(isOverdue("2026-01-01", "pendiente")).toBe(true);
    expect(isOverdue("2026-01-01", "en progreso")).toBe(true);
  });

  it("devuelve false para string vacío", () => {
    expect(isOverdue("", "pendiente")).toBe(false);
  });
});

describe("INITIAL_TASKS", () => {
  it("contiene al menos 5 tareas", () => {
    expect(INITIAL_TASKS.length).toBeGreaterThanOrEqual(5);
  });

  it("todas las tareas tienen los campos requeridos", () => {
    const requiredKeys: (keyof Task)[] = ["id", "title", "description", "priority", "status", "dueDate", "assignee", "comments"];
    INITIAL_TASKS.forEach(task => {
      requiredKeys.forEach(key => {
        expect(task).toHaveProperty(key);
      });
    });
  });

  it("los ids son únicos", () => {
    const ids = INITIAL_TASKS.map(t => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
