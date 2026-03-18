import { Github, Linkedin, Mail, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <img
            src="/profilepic.jpg?height=200&width=200"
            alt="Dylan Butz"
            className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-lg object-cover"
          />
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">Dylan Butz</h1>
          <h2 className="text-xl sm:text-2xl text-gray-600 mb-6">Software Engineering. Building with AI.</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Building AI agents and software applications in the cloud.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <a href="https://drive.google.com/file/d/1LCBwecPz1OLgQC_kEc50a0kyRnqGpqfj/view?usp=sharing" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Resume
            </Button>
          </a>
          <a href="mailto:dylanbutz@hotmail.com" className="text-gray-600 hover:text-orange-600 transition-colors">
          <Button variant="outline" size="lg" className="hover:text-orange-600 bg-transparent">
            <Mail className="mr-2 h-4 w-4" />
            Get In Touch
          </Button>
          </a>
        </div>

        <div className="flex justify-center space-x-6">
          <a href="https://github.com/DylanB03" className="text-gray-600 hover:text-orange-600 transition-colors">
            <Github className="h-6 w-6" />
          </a>
          <a href="https://linkedin.com/in/dylanbutz/" className="text-gray-600 hover:text-orange-600 transition-colors">
            <Linkedin className="h-6 w-6" />
          </a>
          <a href="mailto:dylanbutz@hotmail.com" className="text-gray-600 hover:text-orange-600 transition-colors">
            <Mail className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
