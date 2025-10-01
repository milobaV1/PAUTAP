import { Profile } from "@/modules/user/features/settings/profile";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/(user)/_layout/profile/")({
  component: Profile,
});
