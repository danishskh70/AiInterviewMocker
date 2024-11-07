import { useRouter } from "next/router";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#90f6d7] via-[#35bcbf] to-[#263849] text-white">
      {/* Header Section */}
      <h1 className="text-5xl font-bold animate-fadeIn mb-4">Welcome to AI Interview Mocker</h1>
      <p className="text-lg opacity-90 mb-8 text-center max-w-lg animate-slideUp">
        Prepare for interviews with AI-driven mock sessions, tailored feedback, and personalized insights to enhance your skills.
      </p>

      {/* Image Section */}
      <div className="relative w-48 h-48 mb-6 animate-bounce">
        <Image
          src="/interview.png"  // Replace with the path to your image
          alt="Interview"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>

      {/* "Get Started" Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="px-8 py-3 bg-[#41506b] hover:bg-[#263849] rounded-full text-white font-semibold transition-transform duration-300 ease-in-out transform hover:scale-110"
      >
        Get Started
      </button>

      {/* Features Section */}
      <div className="mt-12 flex flex-col items-center space-y-8 max-w-lg text-center">
        <h2 className="text-3xl font-semibold">Why Choose Us?</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#35bcbf] p-2 rounded-full">
              <Image src="/feedback.png" width={24} height={24} alt="Feedback" />
            </div>
            <p>Instant Feedback and Analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-[#35bcbf] p-2 rounded-full">
              <Image src="/ai-powered.png" width={24} height={24} alt="AI Powered" />
            </div>
            <p>AI-Powered Mock Interviews</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-[#35bcbf] p-2 rounded-full">
              <Image src="/personalized.png" width={24} height={24} alt="Personalized" />
            </div>
            <p>Personalized Training Experience</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-16 text-sm opacity-70">
        © 2024 AI Interview Mocker - Enhancing Your Career One Interview at a Time
      </footer>
    </div>
  );
}
