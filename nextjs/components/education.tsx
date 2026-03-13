import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Calendar, MapPin } from "lucide-react"

export function Education() {
  const education = [
    {
      degree: "Software Engineering",
      school: "Carleton University",
      location: "Ottawa, ON",
      period: "2024-2028",
      gpa: "3.9/4.0",
      description: "Course work includes: Object-Oriented Programming, Algorithms and Datastructures",
      coursework: ["Advanced Algorithms", "C", "Python", "Java", "Object-Oriented Programming"],
    }
  ]

  return (
    <section id="education" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Education</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            My academic background and the foundation of my technical knowledge.
          </p>
        </div>

        <div className="space-y-8">
          {education.map((edu, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl text-gray-900">{edu.degree}</CardTitle>
                        <p className="text-lg font-semibold text-orange-600">{edu.school}</p>
                        <p className="text-gray-600">GPA: {edu.gpa}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {edu.period}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {edu.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{edu.description}</p>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Relevant Coursework:</h4>
                  <div className="flex flex-wrap gap-2">
                    {edu.coursework.map((course) => (
                      <span key={course} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
