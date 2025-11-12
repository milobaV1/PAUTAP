import { StaffDetailsPage } from "@/modules/user/features/users/user-details2";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

const StaffDetailsWrapper = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/users" });
  };

  return <StaffDetailsPage onBack={handleBack} />;
};

export const Route = createFileRoute("/_auth/(user)/_layout/users/$id/")({
  component: StaffDetailsWrapper,
});
