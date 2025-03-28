"use client";

import { useLayout } from "@/app/providers/layout-provider";
import { Button } from "@/components/ui/button";
import { Coins, Home, MapPin, Medal, Trash } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: MapPin, label: "Report Waste" },
  { href: "/collect", icon: Trash, label: "Collect Waste" },
  { href: "/rewards", icon: Coins, label: "Rewards" },
  { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
];

export const Sidebar = ({ userRole }) => {
  const { sidebarOpen } = useLayout();
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r pt-20 border-gray-200 text-gray-800 w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <nav className="h-full flex flex-col justify-between">
        <div className="px-4 py-6 space-y-8">
          {sidebarItems
            .filter((item) => !(item.href === "/collect" && userRole !== "admin"))
            .map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={`w-full justify-start py-3 ${
                    pathname === item.href ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="text-base">{item.label}</span>
                </Button>
              </Link>
            ))}
        </div>
      </nav>
    </aside>
  );
};
