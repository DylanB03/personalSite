import { Projects } from "@/components/projects"
import { ThemeToggle } from "@/components/theme-toggle"
import { FooterLinks } from "@/components/footer-links"

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="max-w-2xl mx-auto px-6 py-8 flex items-center justify-between">
        <a href="/" className="text-3xl sm:text-4xl font-semibold text-foreground">
          Dylan Butz
        </a>
        <ThemeToggle />
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="pt-2">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </a>
        </div>

        <div className="mt-8">
          <Projects />
        </div>

        <FooterLinks />
      </div>
    </main>
  )
}

