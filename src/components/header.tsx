"use client";

import { useLayout } from "@/app/providers/layout-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { UserButton } from "@clerk/nextjs";
import { Badge, Bell, Coins, Leaf, Menu, Search } from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { markNotificationAsRead } from "@/utils/db/actions/notifications.actions";
import toast from "react-hot-toast";
interface HeaderProps {
  balance: number;
  userId: string;
  notifications: Notifications[];
}
export const Header: FC<HeaderProps> = ({ balance, userId, notifications }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toggleSidebar } = useLayout();
  const [notificationsData, setNotificationsData] = useState(notifications);
  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotificationsData((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Error marking notification as read");
    }
  };
  useEffect(() => {
    if (notifications !== notificationsData) {
      setNotificationsData(notifications);
    }
  }, [notifications]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:mr-4 lg:hidden" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg text-gray-800">Eco Vision</span>
              <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">AI Smart Waste Management</span>
            </div>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5" />
                {notificationsData.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">{notificationsData.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4">
              {notificationsData.length > 0 ? (
                notificationsData.map((notification) => (
                  <DropdownMenuItem key={notification.id} onClick={() => handleNotificationClick(notification.id)}>
                    <div className="flex flex-col">
                      <span className="font-medium capitalize">{notification.type}</span>
                      <span className="text-sm text-gray-500">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-center p-1">No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-2 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">{balance.toFixed(2)}</span>
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
};
