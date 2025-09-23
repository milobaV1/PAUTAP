import {
  Home,
  BookOpen,
  FileCheck,
  Trophy,
  Award,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { isAdmin } from "@/utils/auth-extension";

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", icon: Home, to: "/" },
    { name: "Sessions", icon: BookOpen, to: "/session" },
    //{ name: "sessions", icon: FileCheck, to: "/sessions" },
    { name: "Monthly Trivia", icon: Trophy, to: "/trivia" },
    { name: "Certificates", icon: Award, to: "/certificate" },
  ];

  //FIX THIS: MULTIPLE LOGS AND I NEED TO KNOW WHY
  const isCurrentPage = (path: string) => {
    // console.log("This is the location.pathname: ", location.pathname);
    // console.log("This is the path: ", path);
    // return location.pathname.includes(path);
    console.log("This is the location.pathname: ", location.pathname);
    console.log("This is the path: ", path);
    return location.pathname === path;
  };

  const handleNavigation = (to: string) => {
    navigate({ to });
    setSidebarOpen(false);
  };

  const admin = isAdmin();
  return (
    <div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 pau-gradient">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#2e3f6f]" />
            </div>
            <h1 className="text-white font-semibold">PAU Learning</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Button
                  variant={isCurrentPage(item.to) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isCurrentPage(item.to)
                      ? "bg-[#2e3f6f] text-white hover:bg-[#2e3f6f]/90"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleNavigation(item.to)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </li>
            ))}
          </ul>
          {admin ? (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate({ to: "/admin" })}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Back to Admin Portal
              </Button>
            </div>
          ) : (
            ""
          )}
        </nav>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
              <AvatarFallback className="bg-[#2e3f6f] text-white">
                JS
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Michael Iloba
              </p>
              <p className="text-xs text-gray-500 truncate">Faculty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
