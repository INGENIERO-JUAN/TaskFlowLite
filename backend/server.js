import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/taskflowlite";

app.use(express.json());

// ─── CORS configuration with secure origin filtering (.filter(Boolean)) ───
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origen (como apps móviles o curl)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy blocks access from origin ${origin}`));
      }
    },
    credentials: true,
  })
);

// ─── MongoDB Connection ──────────────────────────────────────────────────────
let db;
const client = new MongoClient(MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db();
    console.log("[Backend Database] Connected successfully to MongoDB");
  } catch (err) {
    console.error("[Backend Database] Connection error:", err);
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// Helper to ensure database is ready
const checkDb = (req, res, next) => {
  if (!db) {
    return res.status(503).json({ message: "Database not ready, please try again." });
  }
  next();
};

// ─── API Routes ──────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", database: db ? "Connected" : "Disconnected" });
});

// Authentication
app.post("/api/auth/register", checkDb, async (req, res) => {
  try {
    const { name, email, password, workspaceAction, workspaceName, workspaceCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña obligatorios." });
    }

    const usersColl = db.collection("users");
    const existingUser = await usersColl.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "Este email ya está registrado." });
    }

    let code = workspaceCode;
    const workspacesColl = db.collection("workspaces");

    if (workspaceAction === "create") {
      if (!workspaceName) {
        return res.status(400).json({ message: "Nombre del workspace es obligatorio." });
      }
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await workspacesColl.insertOne({
        code,
        name: workspaceName,
        ownerEmail: email.toLowerCase(),
        members: [email.toLowerCase()],
      });
    } else {
      if (!workspaceCode) {
        return res.status(400).json({ message: "Código del workspace es obligatorio." });
      }
      const ws = await workspacesColl.findOne({ code: workspaceCode.toUpperCase() });
      if (!ws) {
        return res.status(404).json({ message: "El workspace ingresado no existe." });
      }
      code = workspaceCode.toUpperCase();
      await workspacesColl.updateOne(
        { code },
        { $addToSet: { members: email.toLowerCase() } }
      );
    }

    const newUser = {
      name,
      email: email.toLowerCase(),
      password, // En producción usar bcrypt
      workspaceCode: code,
    };

    await usersColl.insertOne(newUser);

    const wsInfo = await workspacesColl.findOne({ code });
    const userSession = {
      name,
      email: email.toLowerCase(),
      workspaceCode: code,
      workspaceName: wsInfo.name,
      isWorkspaceOwner: wsInfo.ownerEmail === email.toLowerCase(),
    };

    res.status(201).json({
      user: userSession,
      token: `mock-jwt-token-for-${email}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", checkDb, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos." });
    }

    const usersColl = db.collection("users");
    const user = await usersColl.findOne({ email: email.toLowerCase() });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const workspacesColl = db.collection("workspaces");
    const wsInfo = await workspacesColl.findOne({ code: user.workspaceCode });

    const userSession = {
      name: user.name,
      email: user.email,
      workspaceCode: user.workspaceCode,
      workspaceName: wsInfo ? wsInfo.name : "Default Workspace",
      isWorkspaceOwner: wsInfo ? wsInfo.ownerEmail === user.email : false,
    };

    res.json({
      user: userSession,
      token: `mock-jwt-token-for-${email}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Sesión cerrada correctamente." });
});

// Workspace members
app.get("/api/workspace/members", checkDb, async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Parámetro 'code' requerido." });
    }

    const workspacesColl = db.collection("workspaces");
    const ws = await workspacesColl.findOne({ code: code.toUpperCase() });
    if (!ws) {
      return res.status(404).json({ message: "Workspace no encontrado." });
    }

    const usersColl = db.collection("users");
    const members = await usersColl
      .find({ email: { $in: ws.members } })
      .project({ name: 1, email: 1, _id: 0 })
      .toArray();

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tasks
app.get("/api/tasks", checkDb, async (req, res) => {
  try {
    const { workspace } = req.query;
    if (!workspace) {
      return res.status(400).json({ message: "Workspace query param requerido." });
    }

    const tasksColl = db.collection("tasks");
    const list = await tasksColl.find({ workspaceCode: workspace }).toArray();

    // Adaptar _id a id para paridad con el frontend
    const formatted = list.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      assignee: t.assignee || "",
      comments: t.comments || [],
      evidence: t.evidence,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/tasks", checkDb, async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, assignee, workspaceCode } = req.body;

    if (!title || !workspaceCode) {
      return res.status(400).json({ message: "Título y workspaceCode obligatorios." });
    }

    const tasksColl = db.collection("tasks");
    const newId = Date.now();
    const newTask = {
      id: newId,
      title,
      description: description || "",
      priority: priority || "media",
      status: status || "pendiente",
      dueDate: dueDate || "",
      assignee: assignee || "",
      workspaceCode,
      comments: [],
    };

    await tasksColl.insertOne(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/tasks/:id", checkDb, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;

    const tasksColl = db.collection("tasks");
    const result = await tasksColl.updateOne({ id }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const updated = await tasksColl.findOne({ id });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/tasks/:id", checkDb, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const tasksColl = db.collection("tasks");
    const result = await tasksColl.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    res.json({ message: "Tarea eliminada correctamente." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`[Backend Server] Running on port ${String(PORT)}`);
});
