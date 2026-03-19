/**
 * Register Page
 * - Validación completa con Zod + zodResolver
 * - isSubmitting para el estado de carga
 * - Indicador de fortaleza de contraseña
 * - Registro gestionado por AuthContext (useAuth)
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .min(2, "Mínimo 2 caracteres")
      .max(60, "Máximo 60 caracteres"),
    company: z.string().max(80, "Máximo 80 caracteres").optional().or(z.literal("")),
    email: z
      .string()
      .min(1, "El email es obligatorio")
      .email("Introduce un email válido"),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
      .min(8, "Mínimo 8 caracteres")
      .max(100, "Máximo 100 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    terms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos para continuar",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Password strength helper ─────────────────────────────────────────────────

function getPasswordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Débil", color: "bg-red-400" };
  if (score === 2) return { score, label: "Regular", color: "bg-yellow-400" };
  if (score === 3) return { score, label: "Buena", color: "bg-blue-400" };
  return { score, label: "Excelente", color: "bg-green-500" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: { terms: false },
  });

  const watchedPassword = watch("password", "");
  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        company: data.company || undefined,
      });
      navigate("/dashboard");
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Error al crear la cuenta. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo — Formulario ────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <Link to="/" className="text-gray-900 no-underline" style={{ fontWeight: 700 }}>
              TaskFlow <span className="text-blue-600">Lite</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1
              className="text-gray-900 mb-1"
              style={{ fontSize: "1.75rem", fontWeight: 800 }}
            >
              Crear cuenta gratis
            </h1>
            <p className="text-gray-500 text-sm">
            </p>
          </div>

          {/* Error global */}
          {errors.root && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Nombre + Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre completo *"
                type="text"
                placeholder="Juan Pérez"
                leftIcon={<User size={16} />}
                error={errors.name?.message}
                autoComplete="name"
                {...register("name")}
              />
              <Input
                label="Empresa (opcional)"
                type="text"
                placeholder="Mi Empresa S.A."
                leftIcon={<Building2 size={16} />}
                error={errors.company?.message}
                autoComplete="organization"
                {...register("company")}
              />
            </div>

            <Input
              label="Correo electrónico *"
              type="email"
              placeholder="tu@empresa.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />

            {/* Password + strength bar */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="Contraseña *"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                autoComplete="new-password"
                {...register("password")}
              />
              {/* Barra de fortaleza */}
              {watchedPassword && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 w-16 text-right">
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Confirmar contraseña *"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />

            {/* Términos */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer mt-0.5"
                  {...register("terms")}
                />
                <span className="text-sm text-gray-600">
                  Acepto los{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Términos de servicio
                  </a>{" "}
                  y la{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Política de privacidad
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Botón con isSubmitting */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
              className="mt-1"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta gratis"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 no-underline"
              style={{ fontWeight: 600 }}
            >
              Iniciar sesión
            </Link>
          </p>

          {/* Demo hint */}
          
        </div>
      </div>

      {/* ── Panel derecho — Visual ──────────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 to-blue-700 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-x-1/4 translate-y-1/4" />

        <div className="relative text-white max-w-sm text-center">
          <h2
            className="text-white mb-4"
            style={{ fontSize: "2rem", fontWeight: 800 }}
          >
            Todo en un solo lugar
          </h2>
          <p className="text-blue-100 mb-10" style={{ lineHeight: 1.7 }}>
            Sin límites ocultos. Sin sorpresas. Empieza tus tareas desde el
            primer día.
          </p>

          <div className="flex flex-col gap-5">
            {[
              {
                label: "Proyectos ilimitados",
                desc: "Organiza todo sin restricciones",
              },
              {
                label: "Hasta 5 colaboradores",
                desc: "Invita a tu equipo inmediatamente",
              },
              
              
              
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 text-left">
                <div className="w-6 h-6 bg-blue-400/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={14} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-white text-sm" style={{ fontWeight: 600 }}>
                    {item.label}
                  </p>
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
