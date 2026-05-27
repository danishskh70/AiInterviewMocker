import { Lightbulb, Volume2, PauseCircle, PlayCircle, Square } from 'lucide-react'
import React, { useState, useEffect } from 'react'

function QuestionSection({ mockInterviewQuestion, activeQuestionIndex }) {
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Stop speech when question changes
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [activeQuestionIndex]);

  const toggleSpeech = () => {
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      const text = mockInterviewQuestion[activeQuestionIndex]?.Question;
      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(speech);
        setIsPlaying(true);
      } else {
        alert('Sorry, your browser doesn’t support text-to-speech.');
      }
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div>
      <div className="p-5 border rounded-lg my-10">
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {Array.isArray(mockInterviewQuestion) && mockInterviewQuestion.map((item, index) => (
            <div key={index}>
              <h2 className={`text-xs md:sm text-center p-2 ${activeQuestionIndex === index && 'bg-teal-400 text-white'} bg-secondary border rounded-full cursor-pointer`}>
                Question No. #{index + 1}
              </h2>
            </div>
          ))}
        </div>
        <h2 className='my-5 text-md md:text-lg'>{mockInterviewQuestion[activeQuestionIndex]?.Question}</h2>
        <div className='flex items-center gap-3'>
          {isPlaying ? (
            <>
              {isPaused ? 
                <PlayCircle className='cursor-pointer' onClick={toggleSpeech} /> : 
                <PauseCircle className='cursor-pointer' onClick={toggleSpeech} />
              }
              <Square className='cursor-pointer' onClick={stopSpeech} />
            </>
          ) : (
            <Volume2 className='cursor-pointer' onClick={toggleSpeech} />
          )}
        </div>
        <div className='border rounded-lg p-5 bg-blue-100 mt-2' >
          <h2 className='flex gap-2 items-center text-blue-500 '>
            <Lightbulb />
            <strong>Note : </strong>
          </h2>
          <h2 className='text-sm text-blue-500 my-2'>• <strong>Recommended:</strong> Hit <strong>Record</strong> to speak your answer clearly.<br /> • <strong>Alternative:</strong> Use the <strong>Type manually</strong> option if you prefer to write your response.<br /> • Don't take long breaks, as the recording cuts off after a short quiet spell.<br /> • Press <strong>Next Question</strong> to keep the interview moving smoothly.<br /> • Give short, to-the-point answers to show you're clear and sure of yourself.<br /> • Stay cool—the more you practice the more confident you'll be!</h2>
        </div>
      </div>
    </div>
  )
}

export default QuestionSection

 
