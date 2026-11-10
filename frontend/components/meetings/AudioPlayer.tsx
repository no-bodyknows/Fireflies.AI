'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { formatTime } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl?: string;
  totalDuration: number; // in seconds
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  darkMode: boolean;
}

export default function AudioPlayer({
  audioUrl,
  totalDuration,
  currentTime,
  onTimeUpdate,
  isPlaying,
  onPlayPause,
  onSeek,
  darkMode,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [useFallbackTimer, setUseFallbackTimer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync playback rate with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Audio simulation timer fallback if audio element fails to load or empty
  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && !useFallbackTimer) {
        audioRef.current.play().catch(() => {
          // If browser blocks autoplay or network audio fails, seamlessly use fallback timer
          setUseFallbackTimer(true);
        });
      }

      if (useFallbackTimer) {
        timerRef.current = setInterval(() => {
          onTimeUpdate(Math.min(totalDuration, currentTime + playbackRate * 0.25));
        }, 250);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, useFallbackTimer, playbackRate, currentTime, totalDuration, onTimeUpdate]);

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !useFallbackTimer) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    onSeek(newTime);
    if (audioRef.current && !useFallbackTimer) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSkip = (seconds: number) => {
    const target = Math.max(0, Math.min(totalDuration, currentTime + seconds));
    onSeek(target);
    if (audioRef.current && !useFallbackTimer) {
      audioRef.current.currentTime = target;
    }
  };

  const handleAudioEnded = () => {
    onSeek(0);
    if (isPlaying) onPlayPause();
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-colors shadow-sm ${
        darkMode ? 'bg-[#121422] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Real audio element */}
      <audio
        ref={audioRef}
        src={audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        onError={() => setUseFallbackTimer(true)}
        muted={isMuted}
        preload="metadata"
      />

      {/* Progress Scrubber Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={totalDuration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-violet-600 bg-slate-200 dark:bg-slate-800"
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center space-x-1">
            {/* Animated Waveform Bars */}
            <div className="flex items-center space-x-0.5 px-2">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 65, 85, 30].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all duration-150 ${
                    isPlaying ? 'bg-violet-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(4, (h * ((i % 3) + 1)) / 10)}px` : '4px',
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </div>
          </div>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Skip Back 10s */}
          <button
            onClick={() => handleSkip(-10)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Big Play / Pause */}
          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Skip Forward 10s */}
          <button
            onClick={() => handleSkip(10)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector & Mute */}
        <div className="flex items-center space-x-2">
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className={`px-2 py-1 rounded-lg border text-[11px] font-semibold focus:outline-none ${
              darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
