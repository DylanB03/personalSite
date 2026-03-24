import { Github, ArrowUpRight } from "lucide-react"

type Project = {
  title: string
  description: string
  toolsUsed: string
  image: string
  github: string
}

const mainProjects: Project[] = [
    {
      title: "Job scheduler",
      description:
        "Built a custom gymnasium environment for a job queue, using wait times and priority levels. Trained a model with PPO reinforcement learning using StableBaseline3, and a custom built PPO agent using PyTorch. Benchmarked model performance against heuristic baselines with graphical analysis in MatPlotLib.",
      toolsUsed: "Tools Used: Python, PyTorch, StableBaselines3, NumPy, Jupyter Notebook.",
      image: "/projects/job-scheduler.png?height=200&width=300",
      github: "https://github.com/DylanB03/Job-Scheduler",
    },
    {
      title: "Transport Times",
      description:
        "Developed a web application to view public transportation times and google calendar events. Synced backend with Google Cloud Platform, public transportation, and map tiling API’s. Allowed users to select stations to monitor using a map interface with MapLibre.",
      toolsUsed: "Tools Used: Python, GCP, JavaScript, HTML, CSS.",
      image: "/projects/transport-times.png?height=200&width=300",
      github: "https://github.com/DylanB03/transportTimes",
    },
    {
      title: "webCrawler",
      description:
        "Built a desktop application to crawl websites and extract visual assets including fonts, colors, images, and icons. Implemented recursive same-domain crawling with robots.txt safeguards and bounded limits, a PySide6 tabbed UI with local project persistence, and HTML/CSS extraction using BeautifulSoup, lxml, and tinycss2.",
      toolsUsed: "Tools Used: Python, PySide6, BeautifulSoup, lxml, tinycss2.",
      image: "/projects/webcrawler.png?height=200&width=300",
      github: "https://github.com/DylanB03/webCrawler",
    },
]

/** Shown only on `/projects` (not the home page project list). */
const projectsPageOnly: Project[] = [
  {
    title: "Progress Check",
    description:
      "Built in grade 10 as a web application for educators to track student progress on assignments through classroom dashboards, join codes, and color-coded submissions. Implemented server-side PHP with a relational SQL database for accounts, classes, assignments, and student responses.",
    toolsUsed: "Tools Used: PHP, JavaScript, HTML, CSS, MySQL.",
    image: "/projects/progress-check.png?height=200&width=300",
    github: "https://github.com/DylanB03/ProgressCheckWebsite",
  },
]

export function Projects({
  showViewAllLink = false,
  projectsPageExtras = false,
}: {
  showViewAllLink?: boolean
  /** Extra entries appended at the bottom on the full projects page only. */
  projectsPageExtras?: boolean
}) {
  const projects = [...mainProjects, ...(projectsPageExtras ? projectsPageOnly : [])]

  return (
    <section aria-label="Projects" className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/80">Projects</h2>

      <ul className="space-y-3">
        {projects.map((project) => (
          <li key={project.title} className="flex gap-3 items-start">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-medium text-foreground">{project.title}</div>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} GitHub`}
                  className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <p className="text-sm text-muted-foreground">{project.toolsUsed}</p>
            </div>
          </li>
        ))}
      </ul>

      {showViewAllLink && (
        <a
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all projects
          <ArrowUpRight className="h-4 w-4" />
        </a>
      )}
    </section>
  )
}
