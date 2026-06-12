/**
 * Login Page — Migrado a useAuthStore (Zustand) + Sonner toasts.
 * - Validación con Zod + react-hook-form
 * - Feedback visual: spinner durante carga, toast en error
 * - useNavigate para redirección programática post-login
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input }  from "../components/ui/input";
import { useAuth } from "../hooks/useAuth";

const loginSchema = z.object({
  /* eslint-disable-next-line @typescript-eslint/no-deprecated */
  email:    z.string().min(1, "El email es obligatorio").email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria").min(6, "Mínimo 6 caracteres"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("¡Bienvenido de vuelta!");
      void navigate("/dashboard");
    } catch (error) {
      const msg = error instanceof Error ? error.message : /* v8 ignore next */ "Error al iniciar sesión.";
      setError("root", { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-blue-500/30 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative text-white text-center max-w-sm">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap size={30} className="text-white" />
          </div>
          <h2 className="text-white mb-4" style={{ fontSize: "2rem", fontWeight: 800 }}>
            Bienvenido de vuelta
          </h2>
          <p className="text-blue-100" style={{ lineHeight: 1.7 }}>
            Accede a tus proyectos, tareas y equipo. Todo en un solo lugar.
          </p>
          <div className="mt-10 flex flex-col gap-4 text-left">
            {[
              "Dashboard con métricas en tiempo real",
              "Gestión de tareas por prioridad",
              "Colaboración con tu equipo",
              "Reportes y seguimiento",
            ].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-400/40 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <p className="text-blue-100 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md mx-auto">
          {/* v8 ignore start */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-gray-900 dark:text-white" style={{ fontWeight: 700 }}>
              TaskFlow <span className="text-blue-700">Lite</span>
            </span>
          </div>
          {/* v8 ignore stop */}

          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Iniciar sesión
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {errors.root && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="flex flex-col gap-5" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@empresa.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => { setShowPassword(!showPassword); }}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 p-1.5 -m-1.5 flex items-center justify-center"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              hint="Mínimo 6 caracteres"
              autoComplete="current-password"
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
              </label>
              <button type="button" className="text-sm text-blue-700 hover:text-blue-800 cursor-pointer bg-transparent border-none p-0">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <hr className="flex-1 border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-gray-500">O continúa con</span>
            <hr className="flex-1 border-gray-200 dark:border-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Google", "Microsoft"].map(provider => (
              <button key={provider} type="button"
                className="flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer bg-white dark:bg-gray-950">
                <div className="w-4 h-4 rounded-sm bg-gray-300" />
                {provider}
              </button>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 no-underline" style={{ fontWeight: 600 }}>
              Crear cuenta gratis
            </Link>
          </p>

          <div className="mt-4 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-4 py-3 text-xs text-blue-700 dark:text-blue-300">
            <strong>Demo:</strong> Regístrate primero para crear cuenta. La app funciona sin backend (modo offline).
          </div>
        </div>
      </div>
    </div>
  );
}
