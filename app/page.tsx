import { Experience } from "@/components/experience"
import { FooterLinks } from "@/components/footer-links"
import { Projects } from "@/components/projects"
import { SiteShell } from "@/components/site-shell"

export default function Home() {
  return (
    <SiteShell active="home">
      <div className="home-page">
        <header className="page-heading">
          <p className="eyebrow">Home</p>
          <h1>Dylan Butz</h1>
        </header>

        <div className="home-intro">
          <p>Software Engineering. Building with AI.</p>
          <p>I play guitar, video games (top 0.1% in Valorant and League), and sports.</p>
        </div>

        <div className="home-sections">
          <Experience />
          <Projects showViewAllLink />
        </div>

        <FooterLinks />
      </div>
    </SiteShell>
  )
}
