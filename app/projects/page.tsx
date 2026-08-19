import type { Metadata } from "next"
import Link from "next/link"
import { Projects } from "@/components/projects"
import { SiteShell } from "@/components/site-shell"

export const metadata: Metadata = {
  title: "Projects — Dylan Butz",
  description: "Technical project notes by Dylan Butz.",
}

export default function ProjectsPage() {
  return (
    <SiteShell active="projects">
      <div className="projects-index">
        <header className="page-heading">
          <p className="eyebrow">Projects</p>
          <h1>Things I built, measured, and broke</h1>
          <p className="page-deck">
            Long-form notes on the engineering decisions, failed experiments, and measurements behind my work.
          </p>
        </header>

        <ol className="project-posts">
          <li>
            <Link className="project-post" href="/projects/pokemon-battler">
              <div>
                <p className="project-post-meta">Machine learning · August 2026</p>
                <h2>Training a 0.5B Pokémon model to win on the ranked ladder</h2>
                <p>
                  I rebuilt the loss, the state representation, and the data pipeline before a frozen policy
                  finished with a win rate above 50% across 1,000 public ranked Showdown games.
                </p>
              </div>
              <span aria-hidden="true" className="project-post-arrow">↗</span>
            </Link>
          </li>
        </ol>

        <div className="project-archive">
          <Projects heading="Project archive" projectsPageExtras />
        </div>
      </div>
    </SiteShell>
  )
}
