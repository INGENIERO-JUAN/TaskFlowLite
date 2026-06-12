/**
 * NavbarAuth — Barra de navegación para usuarios autenticados.
 * Incluye toggle de Dark Mode y notificaciones con Sonner.
 */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Zap, Bell, ChevronDown, LogOut, User, Settings,
  LayoutDashboard, StickyNote, Flame, BarChart3, Users,
  Sun, Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth }       from "../hooks/useAuth";
import { useThemeStore } from "../stores/useThemeStore";

export function NavbarAuth() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout }  = useAuth();
  const { isDark, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
    void navigate("/login");
  };

  const displayName  = user?.name  ?? "Usuario";
  const displayEmail = user?.email ?? "usuario@email.com";
  const initials     = displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={15} />, path: "/dashboard" },
    { label: "Notas",     icon: <StickyNote size={15} />,      path: "/notes"     },
    { label: "Hábitos",   icon: <Flame size={15} />,           path: "/habits"    },
    { label: "Reportes",  icon: <BarChart3 size={15} />,       path: "/reports"   },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { void navigate("/dashboard"); }}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white leading-none" style={{ fontWeight: 700, fontSize: "1rem" }}>
                TaskFlow <span className="text-blue-600">Lite</span>
              </span>
              {user?.workspaceName && (
                <span className="text-gray-400 text-[10px] leading-none mt-0.5">{user.workspaceName}</span>
              )}
            </div>
          </div>

          {/* Nav Items desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <button key={item.label} onClick={() => { void navigate(item.path); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-none ${
                    isActive
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-950"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 bg-transparent"
                  }`}>
                  {item.icon}{item.label}
                </button>
              );
            })}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
            </button>

            <button onClick={handleLogout}
              className="md:hidden w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
              title="Cerrar sesión">
              <LogOut size={18} />
            </button>

            {/* Dropdown usuario */}
            <div className="relative">
              <button onClick={() => { setDropdownOpen(!dropdownOpen); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border-none bg-transparent"
                aria-expanded={dropdownOpen} aria-haspopup="true">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ fontWeight: 600 }}>
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm text-gray-800 dark:text-gray-200 max-w-[120px] truncate" style={{ lineHeight: 1.2 }}>{displayName}</span>
                  <span className="text-xs text-gray-400 max-w-[120px] truncate" style={{ lineHeight: 1.2 }}>{displayEmail}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setDropdownOpen(false); }} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-20 py-1 overflow-hidden">

                    {/* Info usuario + workspace */}
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                      <p className="text-sm text-gray-900 dark:text-white" style={{ fontWeight: 600 }}>{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                      {user?.workspaceName && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Users size={11} className="text-blue-500 shrink-0" />
                          <span className="text-xs text-blue-600">{user.workspaceName}</span>
                          {user.isWorkspaceOwner && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded">Admin</span>}
                        </div>
                      )}
                      {user?.workspaceCode && (
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono tracking-widest">
                          Código: {user.workspaceCode}
                        </p>
                      )}
                    </div>

                    {/* Nav móvil */}
                    <div className="md:hidden border-b border-gray-50 dark:border-gray-800 py-1">
                      {navItems.map(item => (
                        <button key={item.label} onClick={() => { void navigate(item.path); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                          {item.icon}{item.label}
                        </button>
                      ))}
                    </div>

                    <button onClick={() => { void navigate("/profile"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                      <User size={15} className="text-gray-400" />Mi perfil
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                      <Settings size={15} className="text-gray-400" />Configuración
                    </button>

                    {/* Toggle dark mode en dropdown */}
                    <button onClick={() => { toggleTheme(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-transparent border-none">
                      {isDark ? <Sun size={15} className="text-yellow-500" /> : <Moon size={15} className="text-blue-500" />}
                      {isDark ? "Modo claro" : "Modo oscuro"}
                    </button>

                    <hr className="my-1 border-gray-100 dark:border-gray-800" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer bg-transparent border-none">
                      <LogOut size={15} />Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
