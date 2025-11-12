import {
  Home,
  BookOpen,
  Trophy,
  Award,
  X,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { isAdmin, isHOD } from "@/utils/auth-extension";
import { useAuthState } from "@/store/auth.store";
import Logo from "../../assets/logo2.png";

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const firstname = user?.first_name ?? "";
  const lastname = user?.last_name ?? "";
  const role = user?.role.name ?? "";

  const navigation = [
    { name: "Dashboard", icon: Home, to: "/" },
    { name: "Sessions", icon: BookOpen, to: "/session" },
    { name: "Monthly Trivia", icon: Trophy, to: "/trivia" },
    { name: "Certificates", icon: Award, to: "/certificate" },
    { name: "Profile", icon: User, to: "/profile" },
  ];

  //FIX THIS: MULTIPLE LOGS AND I NEED TO KNOW WHY
  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (to: string) => {
    navigate({ to });
    setSidebarOpen(false);
  };

  const admin = isAdmin();
  const HOD = isHOD();
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-full h-full" />
            </div>
            <h1 className="text-white font-semibold text-lg">PAU Learning</h1>
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

          {HOD ? (
            <div className="pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 text-blue-600 hover:bg-blue-50"
                onClick={() => navigate({ to: "/users" })}
              >
                <Users className="w-4 h-4 mr-3" />
                View Staff Members
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
              <AvatarFallback>
                <Button onClick={() => navigate({ to: "/profile" })}>
                  {firstname[0]}
                  {lastname[0]}
                </Button>
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {`${firstname} ${lastname}`}
              </p>
              <p className="text-xs text-gray-500 truncate">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
