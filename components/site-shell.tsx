import Link from "next/link"
import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

type SiteShellProps = {
  active: "home" | "projects"
  children: ReactNode
  article?: boolean
}

export function SiteShell({ active, children, article = false }: SiteShellProps) {
  return (
    <div className="site-shell">
      <aside className="site-sidebar">
        <nav aria-label="Primary navigation" className="site-nav">
          <Link className={active === "home" ? "site-nav-link is-active" : "site-nav-link"} href="/">
            <span>home</span>
            {active === "home" && <span aria-hidden="true" className="site-nav-caret" />}
          </Link>
          <Link
            className={active === "projects" ? "site-nav-link is-active" : "site-nav-link"}
            href="/projects"
          >
            <span>projects</span>
            {active === "projects" && <span aria-hidden="true" className="site-nav-caret" />}
          </Link>
        </nav>
        <div className="site-sidebar-controls">
          <ThemeToggle />
        </div>
        <div aria-hidden="true" className="sidebar-rule" />
      </aside>

      <main className={article ? "site-main article-main" : "site-main"}>{children}</main>
    </div>
  )
}
