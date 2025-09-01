import React from 'react';

interface LandingPageProps {
  onStartSetup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartSetup }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-venice-white to-venice-cream flex flex-col">
      {/* Top Navbar with Logo */}
      <div className="bg-venice-white shadow-sm border-b border-venice-stone border-opacity-20">
        <div className="flex justify-center py-4 sm:py-6">
          <div className="flex items-center justify-center">
            <img 
              src="/venice-keys-black.png" 
              alt="Venice Logo" 
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8">
        <div className="text-center max-w-sm w-full space-y-8 sm:space-y-12">
          {/* Elegant Title */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight">
              <span className="text-venice-bright-red font-cursive">Venice</span>
              <span className="text-venice-olive-brown font-cursive ml-1 sm:ml-2">Chatroom</span>
            </h1>
            <p className="text-venice-dark-olive text-xl sm:text-2xl font-light leading-relaxed px-2 sm:px-4">
              Watch AI characters converse in real-time
            </p>
          </div>

          {/* Start Button */}
          <div className="pt-6 sm:pt-8">
            <button
              onClick={onStartSetup}
              className="w-full bg-venice-bright-red text-venice-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-base sm:text-lg shadow-md hover:bg-venice-muted-red active:bg-venice-dark transition-all duration-200"
            >
              Start Chatroom
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-20"></div>
    </div>
  );
};

export default LandingPage;
