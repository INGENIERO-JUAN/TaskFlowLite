/**
 * Profile Page — Perfil del usuario autenticado.
 * Dark mode completo + NavbarAuth eliminada (viene del DashboardLayout).
 */
import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Building2, Lock, Save, CheckCircle2,
  StickyNote, Flame, Trophy, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input }  from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name:    z.string().min(2, "Mínimo 2 caracteres").max(60),
  company: z.string().max(80).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  current: z.string().min(1, "Ingresa tu contraseña actual"),
  newPwd:  z.string().min(8, "Mínimo 8 caracteres"),
  confirm: z.string().min(1, "Confirma la contraseña"),
}).refine(d => d.newPwd === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

type ProfileForm  = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── Storage types ────────────────────────────────────────────────────────────

interface StoredUser {
  name: string;
  email: string;
  password: string;
  workspaceCode: string;
  company?: string;
}

interface StoredTask {
  status: string;
}

interface StoredHabit {
  completedDates?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeParseArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T[] : [];
  } catch {
    return [];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Profile() {
  const { user } = useAuth();

  const [profileSaved,  setProfileSaved]  = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showCurrent,   setShowCurrent]   = useState(false);
  const [showNew,       setShowNew]       = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", company: "" },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: savingPwd },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const stats = useMemo(() => {
    const email = user?.email ?? "guest";
    const workspaceCode = user?.workspaceCode ?? "default";
    const tasks  = safeParseArray<StoredTask>(`tasks_workspace_${workspaceCode}`);
    const notes  = safeParseArray<unknown>(`notes_${email}`);
    const habits = safeParseArray<StoredHabit>(`habits_${email}`);

    const totalTasks     = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completada").length;
    const totalNotes     = notes.length;

    const toStr = (d: Date) => d.toISOString().split("T")[0];

    const bestStreak = habits.reduce((max, h) => {
      const dates = h.completedDates;
      if (!dates?.length) return max;
      const sorted = [...dates].sort().reverse();
      let streak = 0;
      const cur = new Date();
      if (sorted[0] !== toStr(new Date())) cur.setDate(cur.getDate() - 1);
      for (const d of sorted) {
        if (d === toStr(cur)) { streak++; cur.setDate(cur.getDate() - 1); } else break;
      }
      return Math.max(max, streak);
    }, 0);

    return { totalTasks, completedTasks, totalNotes, bestStreak };
  }, [user]);

  const tasa = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const onSaveProfile = async (data: ProfileForm) => {
    await new Promise<void>(r => setTimeout(r, 600));
    const users = safeParseArray<StoredUser>("taskflow_users");
    localStorage.setItem("taskflow_users", JSON.stringify(
      users.map(u => u.email === user?.email ? { ...u, name: data.name, company: data.company ?? "" } : u)
    ));
    try {
      const rawSession = localStorage.getItem("taskflow_user");
      const session = rawSession ? JSON.parse(rawSession) as StoredUser : {};
      localStorage.setItem("taskflow_user", JSON.stringify({ ...session, name: data.name, company: data.company ?? "" }));
    } catch {
      // sesión corrupta, ignorar
    }
    setProfileSaved(true);
    setTimeout(() => { setProfileSaved(false); }, 3000);
  };

  const onSavePassword = async (data: PasswordForm) => {
    setPasswordError("");
    await new Promise<void>(r => setTimeout(r, 600));
    const users = safeParseArray<StoredUser>("taskflow_users");
    const found = users.find(u => u.email === user?.email);
    if (found?.password !== data.current) {
      setPasswordError("La contraseña actual es incorrecta.");
      return;
    }
    localStorage.setItem("taskflow_users", JSON.stringify(
      users.map(u => u.email === user?.email ? { ...u, password: data.newPwd } : u)
    ));
    setPasswordSaved(true);
    resetPwd();
    setTimeout(() => { setPasswordSaved(false); }, 3000);
  };

  const initials = (user?.name ?? "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>Mi perfil</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona tu información personal y configuración de cuenta</p>
      </div>

      {/* Avatar + stats */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl shrink-0" style={{ fontWeight: 700 }}>{initials}</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-gray-900 dark:text-white text-xl" style={{ fontWeight: 700 }}>{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          {[
            { label: "Tareas completadas", value: stats.completedTasks, icon: <CheckCircle2 size={14} />, color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950" },
            { label: "Tasa de éxito",      value: `${tasa.toString()}%`,                icon: <Trophy size={14} />,      color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
            { label: "Notas creadas",      value: stats.totalNotes,                     icon: <StickyNote size={14} />,  color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950" },
            { label: "Mejor racha",        value: `${stats.bestStreak.toString()}d`,    icon: <Flame size={14} />,      color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950" },
          ].map(s => (
            <div key={s.label} className={`rounded-lg p-3 ${s.bg}`}>
              <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>{s.icon}<span className="text-xs">{s.label}</span></div>
              <p className={`text-xl ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario perfil */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center"><User size={15} className="text-blue-600" /></div>
          <h3 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Información personal</h3>
        </div>
        <form onSubmit={(e) => { void handleProfile(onSaveProfile)(e); }} className="flex flex-col gap-4">
          <Input label="Nombre completo *" type="text" placeholder="Juan Pérez" leftIcon={<User size={15} />}
            error={profileErrors.name?.message} {...regProfile("name")} />
          <Input label="Empresa (opcional)" type="text" placeholder="Mi empresa S.A." leftIcon={<Building2 size={15} />}
            error={profileErrors.company?.message} {...regProfile("company")} />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" icon={<Save size={14} />} loading={savingProfile}>
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </Button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 size={15} />Cambios guardados
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Formulario contraseña */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center"><Lock size={15} className="text-amber-600" /></div>
          <h3 className="text-gray-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>Cambiar contraseña</h3>
        </div>
        {passwordError && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-4">
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
          </div>
        )}
        <form onSubmit={(e) => { void handlePwd(onSavePassword)(e); }} className="flex flex-col gap-4">
          <Input label="Contraseña actual *" type={showCurrent ? "text" : "password"} placeholder="••••••••"
            leftIcon={<Lock size={15} />} error={pwdErrors.current?.message}
            rightIcon={
              <button type="button" onClick={() => { setShowCurrent(!showCurrent); }}
                className="cursor-pointer text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...regPwd("current")} />
          <Input label="Nueva contraseña *" type={showNew ? "text" : "password"} placeholder="Mínimo 8 caracteres"
            leftIcon={<Lock size={15} />} error={pwdErrors.newPwd?.message}
            rightIcon={
              <button type="button" onClick={() => { setShowNew(!showNew); }}
                className="cursor-pointer text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...regPwd("newPwd")} />
          <Input label="Confirmar nueva contraseña *" type="password" placeholder="••••••••"
            leftIcon={<Lock size={15} />} error={pwdErrors.confirm?.message}
            {...regPwd("confirm")} />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" icon={<Lock size={14} />} loading={savingPwd}>
              {savingPwd ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
            {passwordSaved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 size={15} />Contraseña actualizada
              </span>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
