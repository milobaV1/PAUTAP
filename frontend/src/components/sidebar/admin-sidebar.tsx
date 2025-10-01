import { LayoutDashboard, Users, Target, Calendar, X } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useLocation, useNavigate } from "@tanstack/react-router";

export function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/admin",
    },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      to: "/admin/user",
    },
    {
      id: "question-management",
      label: "Question Bank",
      icon: Target,
      to: "/admin/question",
    },
    {
      id: "training-session-management",
      label: "Training Sessions",
      icon: Calendar,
      to: "/admin/session",
    },
  ];

  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (to: string) => {
    navigate({ to });
    setSidebarOpen(false);
  };

  return (
    <div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white pau-shadow transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          {/* Mobile close button */}
          <div className="lg:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* Sidebar header */}
          <div className="flex items-center space-x-4 h-16 px-6">
            <div className="w-8 h-8 bg-[#2e3f6f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PAU</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#2e3f6f]">
                Admin Panel
              </h1>
            </div>
          </div>
          <hr />
          {/* Navigation */}
          <nav className="flex-1 px-4 py-7 space-y-2">
            <div className="mb-6">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  return (
                    <Button
                      key={item.id}
                      variant={isCurrentPage(item.to) ? "secondary" : "ghost"}
                      className={`w-full justify-start h-10 ${
                        isCurrentPage(item.to)
                          ? "bg-[#e6f2ff] text-[#2e3f6f] border-l-4 border-[#2e3f6f]"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleNavigation(item.to)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate({ to: "/" })}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Back to User Portal
              </Button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Card className="bg-[#e6f2ff] border-[#2e3f6f]">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#2e3f6f] text-white"
                  >
                    Admin
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Managing PAU Professional Learning Platform
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>
    </div>
  );
}
