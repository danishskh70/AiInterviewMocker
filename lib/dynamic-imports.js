import dynamic from 'next/dynamic';
import Webcam from 'react-webcam';

// Import Webcam dynamically to avoid SSR issues and improve initial load time
const DynamicWebcam = dynamic(() => import('react-webcam'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded-2xl" />,
});

// Update RecordAnswerSection to use DynamicWebcam instead of Webcam directly
// (This would be applied in RecordAnswerSection.jsx)
