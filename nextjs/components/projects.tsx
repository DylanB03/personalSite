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
    title: "StudyBud",
    description:
      "Built a local-first desktop app that turns course PDFs into structured topics, page-cited answers, flashcards, and difficulty-based practice sets. Added selective OCR for poorly extracted pages, persistent study artifacts, and secure OS-keychain credential storage.",
    toolsUsed: "Tools Used: Electron, React, TypeScript, SQLite, PDF.js, PyMuPDF, Tesseract, OpenAI, Ollama.",
    image: "/projects/studybud.svg",
    github: "https://github.com/DylanB03/StudyBud",
  },
  {
    title: "TogetherTune",
    description:
      "Published a Chrome extension serving real users with synchronized YouTube Music playback, shared queues, invite links, and host-controlled permissions. Engineered an authoritative real-time backend with clock sync, automatic reconnection, session recovery, and host transfer, then hardened it with one-time connection tickets, rate limiting, runtime protocol validation, and CI-backed two-client testing.",
    toolsUsed: "Tools Used: TypeScript, React, WXT, Cloudflare Workers, Durable Objects, KV, WebSockets, Vitest, Playwright.",
    image: "/projects/togethertune.svg",
    github: "https://github.com/DylanB03/Youtube-Music-Party-Extension",
  },
  {
    title: "Chudvis",
    description:
      "Led development of a contact-free VS Code extension on a four-person team, combining webcam-based gaze tracking, hand gestures, and voice commands for code navigation and guarded AI-assisted editing. Built the TypeScript extension and native Python perception runtime around a token-authenticated local protocol, with calibration, hold-gated controls, local processing, explicit edit approval, and undo safeguards.",
    toolsUsed: "Tools Used: TypeScript, Python, VS Code Extension API, Backboard, ElevenLabs.",
    image: "/projects/chudvis.png",
    github: "https://github.com/zhe-jac/hackthe6ix",
  },
]

/** Shown only on `/projects` (not the home page project list). */
const projectsPageOnly: Project[] = [
  {
    title: "Job Scheduler",
    description:
      "Built a custom Gymnasium environment for a priority-based job queue. Trained PPO agents with Stable-Baselines3 and PyTorch, then benchmarked their performance against heuristic baselines.",
    toolsUsed: "Tools Used: Python, PyTorch, Stable-Baselines3, NumPy, Jupyter Notebook.",
    image: "/projects/job-scheduler.png?height=200&width=300",
    github: "https://github.com/DylanB03/Job-Scheduler",
  },
  {
    title: "Transport Times",
    description:
      "Developed a web app for viewing public transportation times and Google Calendar events. Integrated Google Cloud, transit, and map-tile APIs with a MapLibre station-selection interface.",
    toolsUsed: "Tools Used: Python, GCP, JavaScript, HTML, CSS.",
    image: "/projects/transport-times.png?height=200&width=300",
    github: "https://github.com/DylanB03/transportTimes",
  },
  {
    title: "webCrawler",
    description:
      "Built a desktop app that recursively crawls websites and extracts fonts, colors, images, and icons, with robots.txt safeguards, bounded crawling, and local project persistence.",
    toolsUsed: "Tools Used: Python, PySide6, BeautifulSoup, lxml, tinycss2.",
    image: "/projects/webcrawler.png?height=200&width=300",
    github: "https://github.com/DylanB03/webCrawler",
  },
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
