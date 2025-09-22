import { SessionResults } from "@/modules/user/features/assessment/assessment-result";
import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import z from "zod";

const searchSchema = z.object({
  sessionTitle: z.string(),
  finalScore: z.number(),
  categoryScores: z.string(), // still a string, you can JSON.parse later
  certificateId: z.string().optional(),
  completionTime: z.coerce.number().optional(),
});

export const Route = createFileRoute(
  "/_auth/(user)/_layout/session/$id/result"
)({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
});

function RouteComponent() {
  const { id: sessionId } = useParams({
    from: "/_auth/(user)/_layout/session/$id/result",
  });

  const search = useSearch({
    from: "/_auth/(user)/_layout/session/$id/result",
  });
  return (
    <SessionResults
      sessionId={sessionId}
      sessionTitle={search.sessionTitle}
      finalScore={search.finalScore}
      categoryScores={JSON.parse(search.categoryScores)}
      certificateId={search.certificateId}
      completionTime={search.completionTime}
    />
  );
}
