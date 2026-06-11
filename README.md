# AI Interview Mocker
AI Interview Mocker – Practice interviews with advanced AI feedback and performance tracking.

---

## 🚀 Key Improvements

- **Calibrated AI Feedback**: Rubric-based evaluation, focus on conceptual understanding, penalty calibration for objective scoring.
- **Smart Analytics**: Centralized dashboard with trend charts, score tracking, category breakdowns.
- **Interview Management**: Create/remove practice sessions easily.

---

## 🌟 Core Features

- **Advanced AI Analysis**: Rubric-based feedback on technical accuracy + conceptual depth.
- **Performance Analytics**: Visual trend charts, filler word tracking.
- **Custom Mock Interviews**: Tailored questions by role, experience, difficulty.
- **Seamless Management**: Start, review, delete sessions.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router) + React
- **Auth**: Clerk
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **AI**: Google Gemini API

---

## 🚀 Getting Started

```bash
git clone https://github.com/danishskh70/ai-interview-mocker.git
cd ai-interview-mocker
npm install
```

### Environment Variables

Create `.env.local` in the root directory and add the following keys:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Neon PostgreSQL Database
DATABASE_URL=your_neon_connection_string

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

For **Production**, ensure the following variables are set in your hosting platform (e.g., Vercel):
`CLERK_SECRET_KEY`, `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `PORT`.

### Database Setup (Neon + Drizzle)

This project uses Drizzle ORM to manage the database. No local PostgreSQL installation is needed.

1. Ensure your `DATABASE_URL` is set correctly in `.env.local`.
2. Push your schema to Neon:
```bash
npx drizzle-kit push
```

### Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Clerk Documentation](https://clerk.com/docs)

---

## 🌐 Website

Live: (add deployed URL)

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request.

---

## 📫 Contact

📧 danishskh70@gmail.com
💼 LinkedIn: [Danish Shaikh](https://linkedin.com/in/danish-shaikh)
