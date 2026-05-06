/**
 * Register Page — Migrado a useAuthStore (Zustand) + Sonner toasts.
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Mail, Lock, User, Zap,
  CheckCircle2, AlertCircle, Plus, Users, Hash,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/Button";
import { Input }  from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import type { RegisterData } from "../stores/useAuthStore";

const registerSchema = z.object({
  name:            z.string().min(2, "Mínimo 2 caracteres").max(60),
  email:           z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password:        z.string().min(8, "Mínimo 8 caracteres").max(100),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  terms:           z.boolean().refine(v => v === true, { message: "Debes aceptar los términos" }),
}).refine(d => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { score: s, label: "Débil",     color: "bg-red-400"    };
  if (s === 2) return { score: s, label: "Regular",   color: "bg-yellow-400" };
  if (s === 3) return { score: s, label: "Buena",     color: "bg-blue-400"   };
  return        { score: s, label: "Excelente", color: "bg-green-500"  };
}

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [wsAction,     setWsAction]     = useState<"create" | "join">("create");
  const [wsName,       setWsName]       = useState("");
  const [wsCode,       setWsCode]       = useState("");
  const [wsError,      setWsError]      = useState("");

  const { register, handleSubmit, watch, setError,
    formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { terms: false },
  });

  const watchedPassword = watch("password", "");
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setWsError("");
    if (wsAction === "create" && !wsName.trim()) { setWsError("El nombre del workspace es obligatorio."); return; }
    if (wsAction === "join"   && !wsCode.trim()) { setWsError("Debes ingresar el código del workspace."); return; }

    try {
      const payload: RegisterData = {
        name:            data.name,
        email:           data.email,
        password:        data.password,
        workspaceAction: wsAction,
        workspaceName:   wsAction === "create" ? wsName : undefined,
        workspaceCode:   wsAction === "join"   ? wsCode : undefined,
      };
      await registerUser(payload);
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/dashboard");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al crear la cuenta.";
      if (msg.includes("workspace") || msg.includes("código")) {
        setWsError(msg);
      } else {
        setError("root", { message: msg });
      }
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — Formulario */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <Link to="/" className="text-gray-900 dark:text-white no-underline" style={{ fontWeight: 700 }}>
              TaskFlow <span className="text-blue-600">Lite</span>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Crear cuenta gratis
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Completa tu información y configura tu espacio de trabajo.</p>
          </div>

          {errors.root && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input label="Nombre completo *" type="text" placeholder="Juan Pérez"
              leftIcon={<User size={16} />} error={errors.name?.message}
              autoComplete="name" {...register("name")} />

            <Input label="Correo electrónico *" type="email" placeholder="tu@email.com"
              leftIcon={<Mail size={16} />} error={errors.email?.message}
              autoComplete="email" {...register("email")} />

            <div className="flex flex-col gap-1.5">
              <Input label="Contraseña *" type={showPassword ? "text" : "password"}
                placeholder="••••••••" leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message} autoComplete="new-password"
                {...register("password")} />
              {watchedPassword && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 w-16 text-right">{strength.label}</span>
                </div>
              )}
            </div>

            <Input label="Confirmar contraseña *" type={showConfirm ? "text" : "password"}
              placeholder="••••••••" leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.confirmPassword?.message} autoComplete="new-password"
              {...register("confirmPassword")} />

            {/* Workspace */}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-gray-700 dark:text-gray-300" style={{ fontWeight: 500 }}>
                Espacio de trabajo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setWsAction("create"); setWsError(""); }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                    wsAction === "create" ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${wsAction === "create" ? "bg-blue-600" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Plus size={14} className={wsAction === "create" ? "text-white" : "text-gray-500"} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${wsAction === "create" ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>Crear nuevo</p>
                    <p className="text-xs text-gray-400">Soy el administrador</p>
                  </div>
                </button>
                <button type="button" onClick={() => { setWsAction("join"); setWsError(""); }}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                    wsAction === "join" ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${wsAction === "join" ? "bg-blue-600" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Users size={14} className={wsAction === "join" ? "text-white" : "text-gray-500"} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${wsAction === "join" ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>Unirme a uno</p>
                    <p className="text-xs text-gray-400">Tengo un código</p>
                  </div>
                </button>
              </div>

              {wsAction === "create" ? (
                <div className="flex flex-col gap-1.5">
                  <input type="text" placeholder="Ej: Agencia Creativa, Mi Equipo..."
                    value={wsName} onChange={e => { setWsName(e.target.value); setWsError(""); }}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${wsError ? "border-red-400" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`} />
                  <p className="text-xs text-gray-400">Se generará un código único para compartir con tu equipo</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Ej: ABC123"
                      value={wsCode} onChange={e => { setWsCode(e.target.value.toUpperCase()); setWsError(""); }}
                      maxLength={6}
                      className={`w-full pl-9 border rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white dark:bg-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest ${wsError ? "border-red-400" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}`}
                      style={{ letterSpacing: "0.15em" }} />
                  </div>
                  <p className="text-xs text-gray-400">Pídele el código al administrador de tu workspace</p>
                </div>
              )}
              {wsError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />{wsError}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer mt-0.5"
                  {...register("terms")} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Acepto los <a href="#" className="text-blue-600 hover:underline">Términos de servicio</a> y la{" "}
                  <a href="#" className="text-blue-600 hover:underline">Política de privacidad</a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />{errors.terms.message}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} disabled={isSubmitting} className="mt-1">
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta gratis"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 no-underline" style={{ fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-x-1/4 translate-y-1/4" />
        <div className="relative text-white max-w-sm text-center">
          <h2 className="text-white mb-4" style={{ fontSize: "2rem", fontWeight: 800 }}>
            Trabajo en equipo real
          </h2>
          <p className="text-blue-100 mb-10" style={{ lineHeight: 1.7 }}>
            Crea tu workspace, comparte el código con tu equipo y trabajen juntos.
          </p>
          <div className="flex flex-col gap-5 text-left">
            {[
              { label: "Crea tu workspace", desc: "Genera un código único para tu equipo" },
              { label: "Comparte el código", desc: "Invita a cualquier persona con 6 caracteres" },
              { label: "Trabajen juntos",    desc: "Todos ven y gestionan las mismas tareas" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-blue-400/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-white text-sm" style={{ fontWeight: 600 }}>{item.label}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
