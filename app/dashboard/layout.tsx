"use client"

import type React from "react"
import { useState } from "react"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import AuthCheck from "@/components/auth-check"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AuthCheck>
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="mr-2">
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <div className="hidden md:block">
              <MainNav />
            </div>
            <div className="ml-auto flex items-center gap-4">
              {/* <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-[200px] rounded-md pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div> */}
              <UserNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthCheck>
  )
}

