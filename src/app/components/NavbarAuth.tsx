/**
 * NavbarAuth — Barra de navegación para usuarios autenticados.
 * Navegación real entre Dashboard, Notas y Hábitos.
 */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Zap,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  StickyNote,
  Flame,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function NavbarAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name ?? "Usuario";
  const displayEmail = user?.email ?? "usuario@email.com";
  const company = user?.company;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={15} />, path: "/dashboard" },
    { label: "Notas",     icon: <StickyNote size={15} />,      path: "/notes"     },
    { label: "Hábitos",   icon: <Flame size={15} />,           path: "/habits"    },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-gray-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              TaskFlow <span className="text-blue-600">Lite</span>
            </span>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer border-none ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-transparent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <Bell size={18} />
            </button>

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="md:hidden w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                  style={{ fontWeight: 600 }}
                >
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm text-gray-800 max-w-[120px] truncate" style={{ lineHeight: 1.2 }}>
                    {displayName}
                  </span>
                  {company ? (
                    <span className="text-xs text-blue-500" style={{ lineHeight: 1.2 }}>{company}</span>
                  ) : (
                    <span className="text-xs text-gray-400 max-w-[120px] truncate" style={{ lineHeight: 1.2 }}>
                      {displayEmail}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm text-gray-900" style={{ fontWeight: 600 }}>{displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                      {company && <p className="text-xs text-blue-500 mt-0.5">{company}</p>}
                    </div>

                    {/* Mobile nav links en dropdown */}
                    <div className="md:hidden border-b border-gray-50 py-1">
                      {navItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-none"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-none">
                      <User size={15} className="text-gray-400" />
                      Mi perfil
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer bg-transparent border-none">
                      <Settings size={15} className="text-gray-400" />
                      Configuración
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer bg-transparent border-none"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
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
