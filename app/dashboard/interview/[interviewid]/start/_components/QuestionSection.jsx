import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionSection({ mockInterviewQuestion, activeQuestionIndex }) {
  const textToSpeach = (text) => {
    if ('speechSynthesis' in window) {
      // Create a new SpeechSynthesisUtterance instance
      const speech = new SpeechSynthesisUtterance(text);
      // Speak the text
      window.speechSynthesis.speak(speech);
    } else {
      alert('Sorry, your browser doesn’t support text-to-speech.');
    }
  }

  return (
    <div>
      <div className="p-5 border rounded-lg my-10">
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {Array.isArray(mockInterviewQuestion) && mockInterviewQuestion.map((item, index) => (
            <div key={index}>
              <h2 className={`text-xs md:sm  text-center p-2 ${activeQuestionIndex === index && 'bg-teal-400 text-white'}bg-secondary border rounded-full  cursor-pointer
                `
              }>Question No.  #{index + 1}</h2>
              {/* <p><strong>Question:</strong> {item.Question}</p>
              <p><strong>Answer:</strong> {item.Answer}</p> */}
            </div>
          ))}
        </div>
        <h2 className='my-5 text-md md:text-lg'>{mockInterviewQuestion[activeQuestionIndex]?.Question}</h2>
        <Volume2 className='cursor-pointer' onClick={() => textToSpeach(mockInterviewQuestion[activeQuestionIndex]?.Question)} />
        <div className='border rounded-lg p-5 bg-blue-100 mt-20' >
          <h2 className='flex gap-2 items-center text-blue-500 '>
            <Lightbulb />
            <strong>Note : </strong>
          </h2>
          <h2 className='text-sm text-blue-500 my-2'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit vel quis modi quo voluptas repellat ea deleniti ab, assumenda, suscipit, optio ipsam! Aliquid, provident iste? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex, sed. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias, temporibus soluta. </h2>
        </div>
      </div>
    </div>
  )
}

export default QuestionSection

 