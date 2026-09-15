import React from 'react';
import { Wifi, Battery, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface AndroidStatusBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isMuted, onToggleMute }) => {
  const [currentTime, setCurrentTime] = React.useState('9:41');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-status-bar"
      className="w-full flex items-center justify-between px-6 pt-3 pb-2 text-emerald-300 select-none text-xs font-medium tracking-tight"
    >
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-emerald-200 text-sm tracking-normal">{currentTime}</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
          OFFLINE
        </span>
      </div>

      {/* Center punch-hole camera simulation */}
      <div className="w-3.5 h-3.5 rounded-full bg-black border border-emerald-950/50 shadow-inner flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0a1510] opacity-80" />
      </div>

      {/* Right icons */}
      <div className="flex items-center space-x-2.5">
        <button
          id="btn-sound-toggle"
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute key sounds' : 'Mute key sounds'}
          className="p-1 rounded text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <Wifi className="w-3.5 h-3.5 text-emerald-400/90" />
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-emerald-300 font-mono">98%</span>
          <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/40" />
        </div>
      </div>
    </div>
  );
};
