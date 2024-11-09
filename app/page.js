"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#90f6d7] via-[#35bcbf] to-[#263849] text-white p-6">
      {/* Header Section */}
      <header className="text-center animate-fadeIn mb-8 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold">Welcome to AI Interview Mocker</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90 leading-relaxed">
          Prepare for interviews with AI-driven mock sessions, tailored feedback, and personalized insights to enhance your skills.
        </p>
      </header>

      {/* Image Section */}
      <div className="relative w-40 h-40 md:w-48 md:h-48 mb-16 animate-bounce">
        <Image
          src="/interview.jpg"
          alt="Interview"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
          priority
        />
      </div>

      {/* "Get Started" Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="px-8 py-3 bg-[#41506b] hover:bg-[#263849] rounded-full text-white font-semibold transition-transform duration-200 ease-in-out transform hover:scale-105 shadow-lg -mt-6"
      >
        Get Started
      </button>

      {/* Features Section */}
      <section className="mt-12 flex flex-col items-center space-y-8 max-w-xl text-center animate-fadeIn">
        <h2 className="text-2xl md:text-3xl font-semibold">Why Choose Us?</h2>
        <div className="space-y-4 w-full">
          {[
            { src: "/feedback.jpg", text: "Instant Feedback and Analysis" },
            { src: "/ai-powered.jpg", text: "AI-Powered Mock Interviews" },
            { src: "/personalized.jpg", text: "Personalized Training Experience" },
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 text-left">
              <div className="flex-shrink-0 w-10 h-10 bg-[#35bcbf] p-2 rounded-full shadow-lg flex items-center justify-center">
                <Image src={feature.src} width={24} height={24} alt={feature.text} priority className="rounded-full" />
              </div>
              <p className="text-sm md:text-base">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="mt-16 text-xs md:text-sm opacity-75">
        © 2024 AI Interview Mocker - Enhancing Your Career One Interview at a Time
      </footer>
    </div>
  );
}
