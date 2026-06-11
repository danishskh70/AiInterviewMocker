# AI Interview Mocker
AI Interview Mocker – Practice interviews with advanced AI feedback and performance tracking.

---

## 🚀 Key Improvements

- **Calibrated AI Feedback**: Precision-engineered evaluation rubric focusing on conceptual understanding over keyword matching, with penalty calibration for objective scoring.
- **Smart Analytics**: Centralized performance dashboard with trend charts, score tracking, and category breakdowns.
- **Interview Management**: Easily manage your practice sessions with intuitive creation and removal functionality.

---

## 🌟 Core Features

- **Advanced AI Analysis**: Get actionable, rubric-based feedback on technical accuracy and conceptual depth.
- **Performance Analytics**: Track your progress with visual career trend charts and filler word monitoring.
- **Custom Mock Interviews**: Generate tailored questions based on role, experience, and difficulty level.
- **Seamless Management**: Quickly start, review, or delete mock interview sessions.

---

## 🛠️ Tech Stack

AI Interview Mocker is powered by:

- **Frontend**: React.js with Next.js (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Generative AI (Gemini)

---

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Development Setup

First, clone the repository and install the dependencies:

```bash
git clone https://github.com/danishskh70/ai-interview-mocker.git
cd ai-interview-mocker
npm install
```
Next, set up the PostgreSQL database:

Install PostgreSQL: If you don't have PostgreSQL installed, download and install it from here.
Create a Database: Run the following command in the PostgreSQL terminal:


```bash
CREATE DATABASE ai_interview_mocker;
```
Set up the database connection: Modify the config/db.js file to connect your application to the PostgreSQL database:
js

const { Pool } = require('pg');
const pool = new Pool({
  user: 'your-username',
  host: 'localhost',
  database: 'ai_interview_mocker',
  password: 'your-password',
  port: 5432,
});
module.exports = pool;
Running the App
First, run the development server:

```bash

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying app/page.js. The page auto-updates as you edit the file.

This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.

### 📚 Learn More
To learn more about Next.js, take a look at the following resources:

Next.js Documentation - learn about Next.js features and API.
Learn Next.js - an interactive Next.js tutorial.
You can check out the Next.js GitHub repository - your feedback and contributions are welcome!

### 🌍 Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out Next.js deployment documentation for more details.

### 🌐 Website
Visit the live website: AI Interview Mocker (Replace this with your actual URL)

### 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. If you have ideas to improve this project or find any bugs, feel free to fork the repository and submit a pull request!

### Fork the Project
Create your Feature Branch (git checkout -b feature/YourFeature)
Commit your Changes (git commit -m 'Add YourFeature')
Push to the Branch (git push origin feature/YourFeature)
Open a Pull Request
### 📫 Contact
Have questions or suggestions? Reach out to me:

📧 Email: danishskh70@gmail.com
💼 LinkedIn: Danish Shaikh
✨ Fun Fact
AI Interview Mocker was inspired by the need for smarter, tech-driven interview preparation tools. Let's help job seekers worldwide ace their dream jobs! 💼
