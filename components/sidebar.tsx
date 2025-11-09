"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Building2, MessageSquare, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Prompts", href: "/prompts", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6 gap-3">
      <Image
          src="/centralize.png"
          alt="Centralize Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        
        <h1 className="text-sm font-semibold">Prompt Orchestrator</h1>

      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Account</span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

