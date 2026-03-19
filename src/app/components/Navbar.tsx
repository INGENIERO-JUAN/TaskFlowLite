/**
 * Navbar — Barra de navegación pública (Landing).
 * Cambia dinámicamente según el estado de autenticación (AuthContext).
 * - No autenticado: muestra "Iniciar sesión" y "Comenzar gratis"
 * - Autenticado: muestra "Ir al Dashboard"
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, X, Zap, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Características", href: "#features" },
    { label: "Cómo funciona", href: "#how-it-works" },
    { label: "Precios", href: "#pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span
              className="text-gray-900"
              style={{ fontWeight: 700, fontSize: "1.1rem" }}
            >
              TaskFlow <span className="text-blue-600">Lite</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions — cambian según auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">
                  Hola, <strong>{user?.name.split(" ")[0]}</strong>
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<LayoutDashboard size={15} />}
                  onClick={() => navigate("/dashboard")}
                >
                  Ir al Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Comenzar gratis
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-600 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-700 py-2 no-underline"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<LayoutDashboard size={15} />}
                onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
              >
                Ir al Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    navigate("/register");
                    setMobileOpen(false);
                  }}
                >
                  Comenzar gratis
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
