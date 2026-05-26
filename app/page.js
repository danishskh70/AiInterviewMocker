"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Header Section */}
      <header className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          AI Interview Mocker
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Prepare for interviews with AI-driven mock sessions and personalized insights.
        </p>
      </header>

      {/* "Get Started" Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Get Started
      </button>

      {/* Features Section */}
      <section className="mt-16 w-full max-w-xl text-left">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Why Choose Us?</h2>
        <ul className="space-y-4 text-gray-700">
          <li>• Instant Feedback and Analysis</li>
          <li>• AI-Powered Mock Interviews</li>
          <li>• Personalized Training Experience</li>
        </ul>
      </section>

      {/* Footer Section */}
      <footer className="mt-20 text-sm text-gray-400">
        © 2026 AI Interview Mocker
      </footer>
    </div>
  );
}
