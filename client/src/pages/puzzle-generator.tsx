import { useEffect, useRef } from 'react';

export function PuzzleGeneratorPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Load the puzzle generator in iframe
    if (iframeRef.current) {
      iframeRef.current.src = '/api/puzzle-generator';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Δημιουργός Προσωποποιημένων Puzzle
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Δημιουργήστε μοναδικά puzzle από τις φωτογραφίες σας με προηγμένο αλγόριθμο fractal
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            width="100%"
            height="900"
            style={{ border: 'none' }}
            title="Puzzle Generator"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}