"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HomeIcon, LogOut } from "lucide-react";
import { useAuth } from "@/presentation/auth/store/useAuth.store";
import { useLogout } from "@/presentation/auth/hooks/useAuth.hooks";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();

  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const userData = {
    name:
      isAuthenticated && user?.data?.nombre && user?.data?.apellido
        ? `${user.data.nombre.toUpperCase()} ${user.data.apellido.toUpperCase()}`
        : "Usuario",
    email:
      isAuthenticated && user?.data?.email
        ? user.data.email
        : "usuario@ejemplo.com",
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="border-b bg-gradient-to-r from-[#009590] to-[#003E7E] shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-x-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-x-2 text-white hover:bg-transparent"
            aria-label="Ir al dashboard de FUTURO ARS"
          >
            <HomeIcon className="w-12 h-12" />
            <Label className="font-bold text-lg">FUTURO ARS</Label>
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-auto px-3 bg-transparent hover:bg-transparent cursor-pointer "
            >
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getInitials(userData.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-white sm:inline-block text-sm font-medium">
                  {userData.name}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userData.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userData.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>
                {logoutMutation.isPending ? "Cerrando..." : "Cerrar sesión"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
