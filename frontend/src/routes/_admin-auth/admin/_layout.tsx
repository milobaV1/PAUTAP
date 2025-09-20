import { AdminHeader } from "@/components/header/admin-header";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin-auth/admin/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    // <div className="min-h-screen bg-gray-50">
    //   <AdminHeader />

    //   <div className="flex">
    //     <AdminSidebar />
    //     <main className="flex-1 lg:ml-0">
    //       <div className="p-6">
    //         <Outlet />
    //       </div>
    //     </main>
    //   </div>
    // </div>
    // <div>
    //   <AdminHeader />
    //   <div className="pt-16">
    //     <AdminSidebar />
    //   </div>
    // </div>

    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
