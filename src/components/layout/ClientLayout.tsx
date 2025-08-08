"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Navbar } from "./NavBar"

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ 
  children, 
  className
}: AdminLayoutProps) {
  // ...existing code...
//   const { user } = useAuth()

//   // Log user for debugging
//   React.useEffect(() => {
//   }, [user])


  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col overflow-hidden">

      {/* Main Content */}
      <div className="flex flex-col h-full">
        {/* Navbar */}
        <Navbar/>

        {/* Page Content */}
        <main className={cn("flex-1 min-h-0", className)}>
          <div className="h-full p-2 sm:p-4 lg:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
