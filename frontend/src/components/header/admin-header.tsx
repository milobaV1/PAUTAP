import { Menu, Bell, Users, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthState } from "@/store/auth.store";
import { useNavigate } from "@tanstack/react-router";

export function AdminHeader() {
  const navigate = useNavigate();
  const { logOut, user } = useAuthState();

  const handleLogout = () => {
    logOut();
    navigate({ to: "/login" });
  };
  return (
    <header className="bg-white pau-shadow border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              //onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {/* <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button> */}

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{`${user?.first_name} ${user?.last_name}`}</p>
                <p className="text-xs text-muted-foreground">
                  System Administrator
                </p>
              </div>
              <div className="w-8 h-8 bg-[#e6f2ff] rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-[#2e3f6f]" />
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLogout()}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
