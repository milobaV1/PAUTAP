import { Menu, Bell, Badge, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "@tanstack/react-router";
import { useAuthState } from "@/store/auth.store";

export function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { logOut } = useAuthState();

  const handleLogout = () => {
    logOut();
    navigate({ to: "/login" });
  };
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center space-x-4">
        {/* <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            3
          </Badge>
        </Button> */}
        <Button variant="ghost" size="sm" onClick={() => handleLogout()}>
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
