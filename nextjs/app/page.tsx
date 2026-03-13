import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Projects } from "@/components/projects"
import { Technologies } from "@/components/technologies"
import { Education } from "@/components/education"
import { Certifications } from "@/components/certifications"
import Contact from "@/components/contact"
import { Navigation } from "@/components/navigation"
import { Chatbot } from "@/components/chatbot"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Technologies />
      <Education />
      <Certifications />
      <Contact />
      <Chatbot />
    </main>
  )
}
