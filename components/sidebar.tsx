"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, LayoutDashboard, LogOut, Users, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
    },
    {
      href: "/dashboard/events",
      icon: CalendarDays,
      title: "Events",
    },
    {
      href: "/dashboard/users",
      icon: Users,
      title: "Users",
    },
    {
      href: "/dashboard/teams",
      icon: UserPlus,
      title: "Teams",
    },
  ]

  return (
    <div className={cn("flex h-screen flex-col justify-between border-r bg-background", className)}>
      <div className="flex flex-col">
        <div className="flex h-14 items-center border-b px-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-6 w-6" />
              <span>Event Manager</span>
            </Link>
          )}
          {isCollapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard" className="flex items-center justify-center">
                    <CalendarDays className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Event Manager</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {routes.map((route) => (
              <TooltipProvider key={route.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={route.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        pathname === route.href ? "bg-muted text-primary" : "text-muted-foreground",
                        isCollapsed && "justify-center p-2",
                      )}
                    >
                      <route.icon className={cn("h-5 w-5", isCollapsed && "h-5 w-5")} />
                      {!isCollapsed && <span>{route.title}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{route.title}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            ))}
          </nav>
        </div>
      </div>
      {/* <div className="sticky bottom-0 mt-auto border-t bg-background p-2">
        <Button variant="ghost" size="icon" className="w-full justify-start p-2" asChild>
          <Link href="/logout" className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </Button>
      </div> */}
    </div>
  )
}

