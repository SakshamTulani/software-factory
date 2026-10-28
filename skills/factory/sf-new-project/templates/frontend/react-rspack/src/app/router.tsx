import { createBrowserRouter, Link, Outlet } from "react-router-dom"

import { env } from "@/shared/config/env"
import { modules } from "./modules"

function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex h-14 items-center gap-6 border-b px-6">
        <Link to="/" className="font-semibold">
          {env.PUBLIC_APP_NAME}
        </Link>
        <nav className="flex gap-4 text-muted-foreground text-sm">
          {modules.map((m) => (
            <Link key={m.featureId} to={`/${m.featureId}`} className="hover:text-foreground">
              {m.title}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

function Home() {
  return modules.length === 0 ? (
    <p className="text-muted-foreground">No modules yet. Describe the first one with /sf-spec.</p>
  ) : (
    <p className="text-muted-foreground">Choose a module above.</p>
  )
}

function NotFound() {
  return <p className="text-muted-foreground">Page not found.</p>
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...modules.map((m) => ({ path: `${m.featureId}/*`, children: m.routes })),
      { path: "*", element: <NotFound /> },
    ],
  },
])
