"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface MainNavProps {
  className?: string
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Overview
      </Link>
      <Link
        href="/dashboard/events"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/events" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Events
      </Link>
      <Link
        href="/dashboard/users"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/users" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Users
      </Link>
      <Link
        href="/dashboard/teams"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard/teams" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Teams
      </Link>
    </nav>
  )
}

