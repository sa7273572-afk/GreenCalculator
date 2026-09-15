import React from 'react';

export const AndroidNavBar: React.FC = () => {
  return (
    <div
      id="android-nav-bar"
      className="w-full flex items-center justify-center pt-3 pb-2 select-none"
    >
      {/* Android Gesture Navigation Bar Pill */}
      <div className="w-32 h-1 rounded-full bg-emerald-700/50 hover:bg-emerald-500/70 transition-colors" />
    </div>
  );
};
