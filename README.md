# Dylan Butz — Personal Site

The source for [dylanb.ca](https://www.dylanb.ca), a personal portfolio built with Next.js, React, TypeScript, and Tailwind CSS.

The site includes:

- Selected work experience
- Featured and archived software projects
- Long-form technical project articles
- Links to GitHub, LinkedIn, and email
- Light and dark themes

## Run locally

Requirements:

- Node.js 20 or newer
- npm

Install the locked dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

No environment variables are required to view the portfolio pages.

## Production build

```bash
npm run build
npm start
```

## Project structure

```text
app/          # Pages, project articles, and global styles
components/   # Portfolio sections, navigation, and diagrams
public/       # Project thumbnails and local font assets
package.json  # Scripts and dependencies
```
