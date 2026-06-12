import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/taskflowlite";
const workspaceCode = "8DRZGJ";

const tasks = [
  {
    id: 1,
    title: "Configurar entorno local",
    description: "lo que dice arriba",
    priority: "media",
    status: "en progreso",
    dueDate: "2026-03-19",
    assignee: "Raul Gomez",
    workspaceCode,
    comments: [
      { id: 101, author: "Raul Gomez", text: "Ya empecé con la configuración", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 2,
    title: "Configurar entorno local",
    description: "Configuración inicial de dependencias",
    priority: "baja",
    status: "pendiente",
    dueDate: "2026-03-19",
    assignee: "Laura Lopez",
    workspaceCode,
    comments: []
  },
  {
    id: 3,
    title: "Revisar propuesta de diseño Q2",
    description: "Evaluar mockups y wireframes del nuevo módulo de reportes.",
    priority: "alta",
    status: "en progreso",
    dueDate: "2026-03-14",
    assignee: "Raul Gomez",
    workspaceCode,
    comments: []
  },
  {
    id: 4,
    title: "Reunión de planificación de sprint",
    description: "Definir objetivos y asignar tareas para el próximo sprint.",
    priority: "alta",
    status: "completada",
    dueDate: "2026-03-11",
    assignee: "Maria Delgado",
    workspaceCode,
    comments: [],
    evidence: { note: "Reunión completada. Minuta enviada por correo.", completedAt: new Date().toISOString(), completedBy: "Maria Delgado" }
  },
  {
    id: 5,
    title: "Actualizar documentación de API",
    description: "Documentar endpoints nuevos del módulo de autenticación.",
    priority: "media",
    status: "completada",
    dueDate: "2026-03-17",
    assignee: "Pablo Villa",
    workspaceCode,
    comments: [],
    evidence: { note: "Documentación actualizada en Swagger.", completedAt: new Date().toISOString(), completedBy: "Pablo Villa" }
  },
  {
    id: 6,
    title: "Optimizar consultas de base de datos",
    description: "Mejorar rendimiento en consultas lentas del dashboard.",
    priority: "media",
    status: "en progreso",
    dueDate: "2026-03-19",
    assignee: "Maria Delgado",
    workspaceCode,
    comments: []
  }
];

const demoEmail = "demo@taskflow.test";
const demoPassword = "Demo1234";

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const tasksColl = db.collection("tasks");
    const workspacesColl = db.collection("workspaces");
    const usersColl = db.collection("users");

    // ─── Workspace de prueba ────────────────────────────────────────────────
    await workspacesColl.deleteOne({ code: workspaceCode });
    await workspacesColl.insertOne({
      code: workspaceCode,
      name: "Workspace Demo",
      ownerEmail: demoEmail,
      members: [demoEmail],
    });

    // ─── Usuario de prueba ──────────────────────────────────────────────────
    await usersColl.deleteOne({ email: demoEmail });
    await usersColl.insertOne({
      name: "Usuario Demo",
      email: demoEmail,
      password: demoPassword, // mock auth, sin hash (igual que server.js)
      workspaceCode,
    });

    // ─── Tareas de prueba ───────────────────────────────────────────────────
    // Limpiar tareas anteriores de este workspace para evitar duplicados
    await tasksColl.deleteMany({ workspaceCode });
    await tasksColl.insertMany(tasks);

    console.log("[Seed] Listo. Datos insertados para el workspace:", workspaceCode);
    console.log("[Seed] Credenciales de login:");
    console.log(`[Seed]   email:    ${demoEmail}`);
    console.log(`[Seed]   password: ${demoPassword}`);
  } catch (err) {
    console.error("[Seed] Error al sembrar base de datos:", err);
  } finally {
    await client.close();
  }
}

seed();
