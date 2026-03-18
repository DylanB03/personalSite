export function Experience() {
  const work = [
    { role: "Software and AI/ML Developer", company: "Nokia" },
    { role: "Software Developer", company: "FIRST Robotics Earl of March" },
    { role: "Supervisor", company: "Farmboy Grocery Store" },
  ]

  return (
    <section aria-label="Work" className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/80">Work</h2>
      <ul className="space-y-2">
        {work.map((item) => (
          <li key={`${item.role}@${item.company}`} className="text-sm">
            <span className="text-foreground">{item.role}</span>
            <span className="text-muted-foreground"> @ {item.company}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
