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

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const tasksColl = db.collection("tasks");
    
    // Limpiar tareas anteriores de este workspace para evitar duplicados
    await tasksColl.deleteMany({ workspaceCode });
    
    // Insertar las nuevas tareas
    await tasksColl.insertMany(tasks);
    console.log("[Seed] 6 tareas insertadas exitosamente para el workspace:", workspaceCode);
  } catch (err) {
    console.error("[Seed] Error al sembrar base de datos:", err);
  } finally {
    await client.close();
  }
}

seed();
