"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-20">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

