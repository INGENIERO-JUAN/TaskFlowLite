import React from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  BarChart3,
  Users,
  Zap,
  ArrowRight,
  Star,
  Shield,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Navbar }            from "../components/Navbar";
import { Button }            from "../components/ui/button";
import { Card }              from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const features = [
  { icon: <CheckCircle2 size={22} className="text-blue-600" />, title: "Gestión de tareas intuitiva",    desc: "Crea, asigna y prioriza tareas en segundos. Interfaz limpia diseñada para la productividad real." },
  { icon: <Users size={22} className="text-blue-600" />,        title: "Colaboración en equipo",          desc: "Comparte proyectos, asigna responsables y mantén a todos sincronizados en tiempo real." },
  { icon: <BarChart3 size={22} className="text-blue-600" />,    title: "Reportes y métricas",             desc: "Visualiza el progreso con dashboards intuitivos y exporta informes detallados en un clic." },
  { icon: <Shield size={22} className="text-blue-600" />,       title: "Seguridad empresarial",           desc: "Protección de datos de nivel empresarial con cifrado end-to-end y control de acceso granular." },
  { icon: <Clock size={22} className="text-blue-600" />,        title: "Recordatorios automáticos",       desc: "Configura alertas y notificaciones para nunca perder un deadline importante." },
  { icon: <TrendingUp size={22} className="text-blue-600" />,   title: "Análisis de rendimiento",         desc: "Identifica cuellos de botella y optimiza flujos de trabajo con datos accionables." },
];

const steps = [
  { step: "01", title: "Crea tu espacio de trabajo",  desc: "Registra tu cuenta en menos de 2 minutos, sin tarjeta de crédito requerida." },
  { step: "02", title: "Agrega tu equipo",             desc: "Invita colaboradores con un simple link. Define roles y permisos por proyecto." },
  { step: "03", title: "Empieza a producir",           desc: "Crea tareas, asigna responsables y monitorea el progreso desde tu dashboard." },
];

const testimonials = [
  { name: "Ana García",    role: "Product Manager, TechCorp",       text: "TaskFlow Lite transformó la forma en que gestionamos nuestros sprints. La visibilidad es increíble.", rating: 5 },
  { name: "Carlos Mendez", role: "CTO, StartupXYZ",                  text: "Pasamos de hojas de cálculo caóticas a un flujo de trabajo estructurado. El ROI fue inmediato.",      rating: 5 },
  { name: "Laura Torres",  role: "Operations Lead, Innova S.A.",     text: "La curva de aprendizaje es mínima. Mi equipo adoptó la herramienta en el primer día.",                 rating: 5 },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1.5 text-sm mb-6">
                <Zap size={14} /><span>Productividad empresarial simplificada</span>
              </div>
              <h1 className="text-gray-900 dark:text-white mb-6" style={{ fontSize: "3rem", fontWeight: 800, lineHeight: 1.2 }}>
                Gestiona tu equipo con{" "}<span className="text-blue-600">claridad total</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
                TaskFlow Lite centraliza todas tus tareas, proyectos y colaboradores en un solo lugar. Deja atrás el caos y enfócate en lo que realmente importa.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <Button variant="primary" size="lg" onClick={() => { void navigate("/register"); }} icon={<ArrowRight size={18} />}>
                  Comenzar gratis
                </Button>
                <Button variant="outline" size="lg" onClick={() => { void navigate("/login"); }}>
                  Ver demo
                </Button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758691737217-77302c5f988f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWFtJTIwcHJvZHVjdGl2aXR5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MzI1OTI3MHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="TaskFlow Dashboard"
                  className="w-full h-72 lg:h-96 object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 dark:border-gray-800">
                  <div className="w-9 h-9 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                    <TrendingUp size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Productividad</p>
                    <p className="text-sm text-gray-900 dark:text-white font-bold">+47% este mes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="bg-blue-600 dark:bg-blue-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "10",   label: "equipos activos" },
              { value: "2+",   label: "Tareas completadas globalmente" },
              { value: "99%",  label: "Uptime Garantizado" },
              { value: "MVP",  label: "Prueba Académica :)" },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1.2 }}>{stat.value}</p>
                <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-blue-100 text-xs text-center mt-6">
            Nota: métricas demostrativas para la presentación (sin datos reales de producción).
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm uppercase tracking-wider font-semibold">Características</span>
            <h2 className="text-gray-900 dark:text-white mt-2" style={{ fontSize: "2.25rem", fontWeight: 700 }}>
              Todo lo que necesita tu equipo
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
              Herramientas potentes diseñadas para equipos modernos que quieren moverse rápido sin perder el control.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feature => (
              <Card key={feature.title} hover>
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400" style={{ lineHeight: 1.7 }}>{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full max-w-lg">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758613656529-e3f28f3b413a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbGxhYm9yYXRpb24lMjBkaWdpdGFsJTIwd29ya2Zsb3d8ZW58MXx8fHwxNzczMjU5MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Cómo funciona"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-blue-600 text-sm uppercase tracking-wider font-semibold">Cómo funciona</span>
              <h2 className="text-gray-900 dark:text-white mt-2 mb-8" style={{ fontSize: "2.25rem", fontWeight: 700 }}>
                Empieza en minutos, no en días
              </h2>
              <div className="flex flex-col gap-8">
                {steps.map(step => (
                  <div key={step.step} className="flex items-start gap-5">
                    <div className="w-12 h-12 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400" style={{ lineHeight: 1.7 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button variant="primary" size="lg" onClick={() => { void navigate("/register"); }} icon={<ChevronRight size={18} />}>
                  Crear cuenta gratuita
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm uppercase tracking-wider font-semibold">Testimonios</span>
            <h2 className="text-gray-900 dark:text-white mt-2" style={{ fontSize: "2.25rem", fontWeight: 700 }}>
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.name}>
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 italic" style={{ lineHeight: 1.7 }}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white mb-4" style={{ fontSize: "2.5rem", fontWeight: 800 }}>
            ¿Listo para transformar tu productividad?
          </h2>
          <p className="text-blue-100 mb-8" style={{ fontSize: "1.125rem" }}>
            Únete a más de 10,000 equipos que ya confían en TaskFlow Lite.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="secondary" size="lg" onClick={() => { void navigate("/register"); }}
              className="bg-white text-blue-600 hover:bg-blue-50">
              Comenzar 14 días gratis
            </Button>
            <Button variant="ghost" size="lg" onClick={() => { void navigate("/login"); }}
              className="text-white hover:bg-white/10">
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <Zap size={13} className="text-white" />
                </div>
                <span className="text-white text-sm font-bold">TaskFlow Lite</span>
              </div>
              <p className="text-sm" style={{ lineHeight: 1.7 }}>
                La plataforma de gestión de tareas para equipos modernos y productivos.
              </p>
            </div>
            {[
              { title: "Producto",  items: ["Características", "Precios", "Seguridad", "Integraciones"] },
              { title: "Empresa",   items: ["Sobre nosotros", "Blog", "Carreras", "Contacto"]           },
              { title: "Legal",     items: ["Privacidad", "Términos", "Cookies", "Compliance"]           },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {col.items.map(item => (
                    <li key={item}>
                      <a href="#" className="hover:text-white transition-colors no-underline">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p>© 2026 TaskFlow Lite. Todos los derechos reservados.</p>
            <p>Juan Santander</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
