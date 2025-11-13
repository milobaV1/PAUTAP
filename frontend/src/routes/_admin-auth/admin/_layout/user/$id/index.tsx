import { UserDetailsPage } from "@/modules/admin/features/user-management/user-details2";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

const UserDetailsWrapper = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/admin/user" });
  };

  return <UserDetailsPage onBack={handleBack} />;
};

export const Route = createFileRoute("/_admin-auth/admin/_layout/user/$id/")({
  component: UserDetailsWrapper,
});
