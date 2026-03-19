# TaskFlow Lite

> Plataforma SPA de gestión de tareas para equipos modernos. Desarrollada con React 18, TypeScript, Tailwind CSS v4 y React Router v7.

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Jerarquía de componentes](#jerarquía-de-componentes)
- [Sistema de autenticación](#sistema-de-autenticación)
- [Validaciones de formularios](#validaciones-de-formularios)
- [Rutas](#rutas)
- [Credenciales de prueba](#credenciales-de-prueba)

---

## Características

- **Landing Page** — Hero, características, cómo funciona, testimonios y footer
- **Autenticación simulada** — Login y Register con Zod + React Hook Form
- **Dashboard protegido** — KPIs, lista de tareas con crear / editar / eliminar
- **Rutas protegidas** — `ProtectedRoute` y `GuestRoute` con React Router v7
- **Persistencia de sesión** — Estado de sesión en `localStorage`
- **Diseño responsive** — Mobile-first, adaptado a escritorio

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | — | Tipado estático |
| Vite | 6.3.5 | Bundler y dev server |
| Tailwind CSS | 4.1.12 | Estilos utilitarios |
| React Router | 7.13.0 | Enrutamiento SPA |
| React Hook Form | 7.55.0 | Gestión de formularios |
| Zod | 4.x | Validación de esquemas |
| @hookform/resolvers | 5.x | Integración RHF + Zod |
| Lucide React | 0.487.0 | Iconografía |
| Motion | 12.x | Animaciones |
| MUI + Radix UI | — | Componentes base |

---

## Instalación

### Prerrequisitos

- **Node.js** >= 18
- **pnpm** (recomendado) — o npm / yarn

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/INGENIERO-JUAN/TaskFlowLite
cd TaskFlowlite

# 2. Instalar dependencias
pnpm install

# 3. Iniciar el servidor de desarrollo
pnpm dev
# Abre http://localhost:5173

# 4. Build para producción
pnpm build
# Genera /dist listo para despliegue
```

> Si prefieres npm: reemplaza `pnpm` por `npm run` en los comandos de script.

---

## Estructura del proyecto

```
ProyectoFrontend6/
├── index.html
├── vite.config.ts              # Vite + alias @ → ./src
├── package.json
└── src/
    ├── main.tsx                # Entry point — monta <App />
    ├── styles/
    │   └── index.css           # Estilos globales + Tailwind base
    └── app/
        ├── App.tsx             # AuthProvider + RouterProvider
        ├── routes.tsx          # Definición de rutas (guards incluidos)
        │
        ├── context/
        │   └── AuthContext.tsx # Contexto, Provider y hook useAuth()
        │
        ├── hooks/
        │   ├── useAuth.ts      # Re-exporta useAuth (punto de entrada para componentes)
        │   └── useAuthActions.ts # Lógica de login, register y logout
        │
        ├── pages/
        │   ├── Landing.tsx     # / — Página pública de marketing
        │   ├── Login.tsx       # /login — Formulario de acceso
        │   ├── Register.tsx    # /register — Formulario de registro
        │   └── Dashboard.tsx   # /dashboard — Vista protegida con tareas
        │
        └── components/
            ├── Navbar.tsx          # Navbar pública (se adapta al estado de auth)
            ├── NavbarAuth.tsx      # Navbar para usuarios autenticados
            ├── ProtectedRoute.tsx  # Guard: redirige a /login si no hay sesión
            ├── GuestRoute.tsx      # Guard: redirige a /dashboard si hay sesión
            ├── figma/
            │   └── ImageWithFallback.tsx  # Imagen con SVG de fallback en error
            └── ui/
                ├── Button.tsx      # Botón (5 variantes, 3 tamaños, loading)
                ├── Input.tsx       # Input con label, error, hint e iconos
                ├── Card.tsx        # Card base y KPICard para métricas
                ├── Modal.tsx       # Modal genérico animado con backdrop
                ├── form.tsx        # Primitivas de formulario (RHF + Radix)
                └── [shadcn ui]     # Componentes Radix/shadcn (accordion, dialog…)
```

---

## Jerarquía de componentes

El árbol de renderizado sigue esta estructura de arriba hacia abajo:

```
main.tsx
└── <App>
    └── <AuthProvider>           ← Inyecta contexto de auth a toda la app
        └── <RouterProvider>
            ├── /  →  <Landing>
            │         ├── <Navbar>
            │         ├── Secciones (Hero, Features, Steps, Testimonials, CTA)
            │         └── Footer
            │
            ├── <GuestRoute>     ← Solo accesible si NO hay sesión
            │   ├── /login  →  <Login>
            │   └── /register → <Register>
            │
            └── <ProtectedRoute> ← Solo accesible si HAY sesión
                └── /dashboard → <Dashboard>
                                  ├── <NavbarAuth>
                                  ├── KPI Cards (<KPICard>)
                                  ├── Lista de tareas
                                  ├── <Modal> — Crear / Editar tarea
                                  └── <Modal> — Confirmar eliminación
```

### Componentes reutilizables (`ui/`)

| Componente | Props destacadas | Descripción |
|---|---|---|
| `Button` | `variant`, `size`, `loading`, `icon`, `fullWidth` | Botón con 5 variantes: `primary`, `secondary`, `outline`, `ghost`, `danger` |
| `Input` | `label`, `error`, `hint`, `leftIcon`, `rightIcon` | Input controlado con soporte completo de mensajes y React Hook Form |
| `Card` / `KPICard` | `hover`, `title`, `value`, `change`, `color` | Tarjetas de contenido y métricas de dashboard |
| `Modal` | `isOpen`, `onClose`, `title`, `size`, `footer` | Modal con animación Motion, cierre con Escape y scroll interno |
| `ImageWithFallback` | Extiende `<img>` | Muestra un SVG placeholder si la imagen falla al cargar |

---

## Sistema de autenticación

La autenticación es **local y simulada** (sin backend real). Los datos se persisten en `localStorage`.

### Arquitectura en capas

```
Componentes (Login, Register, NavbarAuth…)
      ↓ import
useAuth()  ← hook público (src/hooks/useAuth.ts)
      ↓ re-exporta desde
AuthContext  (src/context/AuthContext.tsx)
      ↓ delega lógica a
useAuthActions()  (src/hooks/useAuthActions.ts)
```

Esta separación mantiene el contexto declarativo y concentra toda la lógica de negocio en `useAuthActions`.

### `useAuthActions` — Lógica de negocio

Gestiona el estado del usuario y las operaciones de autenticación:

```typescript
// src/app/hooks/useAuthActions.ts

login(email, password)
// → Busca el usuario en localStorage (clave: "taskflow_users")
// → Valida que exista y que la contraseña coincida
// → Guarda la sesión activa en localStorage (clave: "taskflow_user")
// → Actualiza el estado React

register({ name, email, password, company? })
// → Verifica que el email no esté duplicado
// → Persiste el nuevo usuario en "taskflow_users"
// → Inicia sesión automáticamente

logout()
// → Elimina "taskflow_user" de localStorage
// → Resetea el estado a null
```

> **Nota sobre cookies:** el proyecto utiliza `localStorage` en lugar de cookies HTTP para persistir la sesión. Esto simplifica el desarrollo local (sin necesidad de servidor). En un entorno de producción real, se reemplazaría por cookies `HttpOnly` gestionadas desde el servidor para mayor seguridad.

### Claves de `localStorage`

| Clave | Contenido |
|---|---|
| `taskflow_users` | Array de todos los usuarios registrados (incluye password) |
| `taskflow_user` | Objeto del usuario con sesión activa (sin password) |

### Interfaz del contexto

```typescript
interface AuthContextType {
  user: AuthUser | null;          // null si no hay sesión
  isAuthenticated: boolean;       // true si user !== null
  login(email, password): Promise<void>;
  register(data): Promise<void>;
  logout(): void;
}

interface AuthUser {
  name: string;
  email: string;
  company?: string;
}
```

---

## Validaciones de formularios

Se usa **Zod** para esquemas tipados integrados con **React Hook Form** via `zodResolver`.

### Login (`/login`)

| Campo | Reglas |
|---|---|
| Email | Requerido, formato de email válido |
| Password | Requerido, mínimo 6 caracteres |

### Register (`/register`)

| Campo | Reglas |
|---|---|
| Nombre | Requerido, 2–60 caracteres |
| Empresa | Opcional, máx. 80 caracteres |
| Email | Requerido, formato de email válido |
| Password | Requerido, 8–100 caracteres |
| Confirmar password | Debe coincidir con password (`.refine`) |
| Términos | Checkbox obligatorio |

El estado de carga se gestiona con `formState.isSubmitting` — sin `useState` adicional.

---

## Rutas

| Ruta | Guard | Componente | Comportamiento si falla el guard |
|---|---|---|---|
| `/` | Ninguno | `Landing` | — |
| `/login` | `GuestRoute` | `Login` | Redirige a `/dashboard` si hay sesión |
| `/register` | `GuestRoute` | `Register` | Redirige a `/dashboard` si hay sesión |
| `/dashboard` | `ProtectedRoute` | `Dashboard` | Redirige a `/login` si no hay sesión |

---

## Credenciales de prueba

La autenticación es simulada contra `localStorage`. Primero debes **registrarte** con cualquier email válido.

| Situación | Resultado |
|---|---|
| Email nuevo + password ≥ 8 chars | Registro exitoso, sesión iniciada |
| Email ya registrado | Error: "Este email ya está registrado" |
| Email no registrado en Login | Error: "Usuario no registrado" |
| Password incorrecta en Login | Error: "Contraseña incorrecta" |

> Para limpiar todos los usuarios de prueba, abre las DevTools del navegador → Application → Local Storage → elimina `taskflow_users` y `taskflow_user`.

---

## Licencia

MIT © 2026 TaskFlow Lite — Juan Santander
