# tooba.ai — AI Portfolio

> Chat with an AI version of me. Ask anything about my background, skills, projects, or availability.

**[→ Live Demo: tooba-ai-beta.vercel.app](https://tooba-ai-beta.vercel.app/)**

---

## What is this?

Instead of a traditional portfolio that you scroll through, this is a conversational AI that answers questions about me — just like I would in person.

Ask it anything:
- *"What projects have you built?"*
- *"Can Tooba work with AI APIs?"*
- *"Is she available for a working student role?"*
- *"Zeig mir ihre Projekte"* (it works in German too)

---

## Features

- **AI chat** — powered by Google Gemini, answers as me in first person
- **EN / DE toggle** — full German language support for German recruiters
- **Project cards** — live links appear automatically when projects are mentioned
- **CV download** — one click to download my PDF CV
- **Contact form** — send me a message directly from the portfolio
- **Share button** — native share sheet on mobile, copy link on desktop
- **Chat history** — conversations saved in sidebar like ChatGPT
- **Copy responses** — copy any answer with one click
- **Friendly quota message** — graceful error handling if API limit is reached
- **Mobile responsive** — works perfectly on phone at job fairs
- **Dark premium UI** — built with Next.js, TypeScript, Tailwind CSS

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + CSS-in-JS |
| AI | Google Gemini API |
| Email | EmailJS |
| Deployment | Vercel |
| Architecture | Full-stack — API routes built into Next.js, no separate backend |

---

## Run Locally

```bash
# 1. Clone
git clone https://github.com/toobahasnain/tooba.ai.git
cd tooba.ai

# 2. Install
npm install

# 3. Add environment variables
# Create .env.local in root:
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How the AI works

The AI is powered by a detailed system prompt containing my real background — experience, projects, skills, education, achievements, languages, and personality. It answers every question in first person, naturally, like a real conversation.

When the language is switched to DE, the entire system prompt switches to German so responses feel natural, not translated.

Project cards appear automatically when the AI mentions a project — no extra clicks needed.

---

## Project Structure

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Gemini API integration + system prompt |
| `app/page.tsx` | Main chat UI + all components |
| `app/layout.tsx` | App layout + metadata |
| `app/globals.css` | Global styles |
| `public/images/tooba.jpg` | Profile photo |
| `public/Syeda_Tooba_Hasnain_CV.pdf` | Downloadable CV |
| `.env.local` | API keys — not committed |

---

## Author

**Syeda Tooba Hasnain** — Software Developer based in Augsburg, Germany

- Portfolio: [tooba-ai-beta.vercel.app](https://tooba-ai-beta.vercel.app/)
- LinkedIn: [linkedin.com/in/syeda-tooba-hasnain-a9a17119a](https://www.linkedin.com/in/syeda-tooba-hasnain-a9a17119a/)
- GitHub: [github.com/toobahasnain](https://github.com/toobahasnain)
- Email: toobadeutsch@gmail.com

---

*Built with Next.js · TypeScript · Gemini API · EmailJS · Deployed on Vercel*