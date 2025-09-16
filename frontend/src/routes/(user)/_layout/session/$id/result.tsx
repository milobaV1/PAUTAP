import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(user)/_layout/session/$id/result')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(user)/_layout/session/$id/result"!</div>
}
