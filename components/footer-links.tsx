import { Github, Linkedin, Mail, Download } from "lucide-react"

const LINKS = {
  github: "https://github.com/DylanB03",
  linkedin: "https://linkedin.com/in/dylanbutz/",
  email: "mailto:dylanbutz@hotmail.com",
  resume:
    "https://drive.google.com/file/d/1LCBwecPz1OLgQC_kEc50a0kyRnqGpqfj/view?usp=sharing",
}

export function FooterLinks() {
  return (
    <footer className="pt-16 pb-6">
      <div className="flex items-center gap-6 text-muted-foreground">
        <a
          href={LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="inline-flex transition-colors hover:text-foreground"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex transition-colors hover:text-foreground"
        >
          <Linkedin className="h-5 w-5" />
        </a>
        <a
          href={LINKS.email}
          aria-label="Email"
          className="inline-flex transition-colors hover:text-foreground"
        >
          <Mail className="h-5 w-5" />
        </a>
        <a
          href={LINKS.resume}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Resume"
          className="inline-flex transition-colors hover:text-foreground"
        >
          <Download className="h-5 w-5" />
        </a>
      </div>
    </footer>
  )
}

