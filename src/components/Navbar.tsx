"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Compass, Bookmark, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const navLinks = [
    { href: "/", label: "Início", icon: Film },
    { href: "/explorar", label: "Explorar", icon: Compass },
    { href: "/minha-lista", label: "Minha Lista", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-600/20 transition-transform group-hover:scale-105">
              <Film className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Cine<span className="text-rose-500">PT</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/90 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-300">
                <User className="h-3.5 w-3.5 text-rose-500" />
                <span className="max-w-[120px] truncate font-medium">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                title="Terminar Sessão"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navegação Mobile */}
      <nav className="flex md:hidden border-t border-zinc-800/80 bg-zinc-950 px-2 py-1.5 justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium ${
                isActive ? "text-rose-500" : "text-zinc-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
