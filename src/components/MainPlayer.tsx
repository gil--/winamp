import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Square } from 'lucide-react';

interface MainPlayerProps {
  currentSong: {
    title: string;
    artist: string;
    duration: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  onSeek: (value: number) => void;
  onVolumeChange: (volume: number) => void;
  onStop?: () => void;
}

const MainPlayer: React.FC<MainPlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  audioRef,
  currentTime,
  duration,
  onSeek,
  onVolumeChange,
  onStop
}) => {
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bitrate, setBitrate] = useState<string>("128");
  const [sampleRate, setSampleRate] = useState<string>("44");
  const [stereoMode, setStereoMode] = useState<string>("stereo");
  const [showShuffle, setShowShuffle] = useState<boolean>(false);
  const [showRepeat, setShowRepeat] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(true);

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsStopped(true);
      if (onStop) onStop();
    }
  };

  // Update isStopped when playback state changes
  useEffect(() => {
    if (isPlaying) {
      setIsStopped(false);
    }
  }, [isPlaying]);

  // Update isStopped when currentTime changes to 0
  useEffect(() => {
    if (currentTime === 0 && !isPlaying) {
      setIsStopped(true);
    }
  }, [currentTime, isPlaying]);

  const formatTime = (time: number): string => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    onVolumeChange(newVolume / 100);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    onSeek(value);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [audioRef, volume]);

  const getRandomAsciiFace = () => {
    const faces = [
      '(^_^)', '(>_<)', '(^o^)', '(·_·)', '(·.·)',
      '(^-^)', '(≧◡≦)', '(·_·)', '(°□°)', '(¬‿¬)',
      '(^.^)', '(^_~)', '(·.·)', '(°o°)', '(^▽^)'
    ];
    return faces[Math.floor(Math.random() * faces.length)];
  };

  const asciiFace = useMemo(() => getRandomAsciiFace(), [currentSong?.title]);

  return (
    <div className="winamp-main-player w-[275px] select-none">
      {/* Title Bar - with gradient and proper Winamp style */}
      <div className="flex justify-between items-center h-[20px] bg-gradient-to-r from-[#2E2E2E] via-[#4B4B4B] to-[#2E2E2E] px-2">
        <div className="flex items-center gap-2">
          <div className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B]"></div>
          <span className="text-[#D1D1FF] text-[10px] tracking-wider font-bold">WINAMP</span>
        </div>
        <div className="flex gap-1">
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">_</button>
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">×</button>
        </div>
      </div>

      {/* Main Display - with proper grid background and LED-style text */}
      <div className="bg-[#2E2E2E] p-1">
        <div className="bg-[#000000] p-2 grid grid-cols-2 gap-2" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '3px 3px' }}>
          {/* Time and Track Display */}
          <div className="flex items-center space-x-2">
            <div className="text-[#00FF00] font-mono text-xl leading-none">{formatTime(currentTime)}</div>
            <div className="w-2 h-2 bg-[#00FF00]"></div>
          </div>
          <div className="text-[#00FF00] text-xs overflow-hidden relative w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black to-transparent pointer-events-none z-10 opacity-20"></div>
            {currentSong && (
              <div className="relative w-full overflow-hidden">
                <div className={`${currentSong.artist.length + currentSong.title.length > 20 ? 'animate-marquee' : ''}`}>
                  {`${asciiFace} ${currentSong.artist} - ${currentSong.title} [${currentSong.duration}] ${asciiFace}`}
                </div>
              </div>
            )}
            {!currentSong && (
              <span>No song loaded</span>
            )}
          </div>
          {/* Bitrate and Sample Rate */}
          <div className="col-span-2 flex justify-between text-[10px] mt-1">
            <span className="text-[#00FF00]">{bitrate} kbps</span>
            <span className="text-[#00FF00]">{sampleRate} kHz</span>
            <span className="text-[#00FF00]">{stereoMode}</span>
          </div>
        </div>
      </div>

      {/* Volume and Balance Sliders */}
      <div className="bg-[#2E2E2E] px-4 py-2 flex justify-between">
        <div className="flex items-center gap-1">
          <div className="h-[8px] w-[68px] bg-[#000000] border border-[#4B4B4B] relative">
            <div 
              className="h-full bg-[#00FF00]" 
              style={{ width: `${volume}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="text-[#00FF00] text-[8px]">VOL</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-[8px] w-[68px] bg-[#000000] border border-[#4B4B4B]">
            <div className="h-full bg-[#00FF00] w-[50%]"></div>
          </div>
          <div className="text-[#00FF00] text-[8px]">BAL</div>
        </div>
      </div>

      {/* Seek Bar */}
      <div className="bg-[#2E2E2E] px-4 py-2">
        <div className="h-[8px] bg-[#000000] border border-[#4B4B4B] relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[#00FF00]" 
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          ></div>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime || 0}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-[#2E2E2E] p-2 grid grid-cols-8 gap-1">
        <button onClick={onPrev} className="col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center">
          <SkipBack size={12} className="text-[#2E2E2E]" />
        </button>
        <button onClick={onPlayPause} className="col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center">
          {isPlaying ? (
            <Pause size={12} className="text-[#2E2E2E]" />
          ) : (
            <Play size={12} className="text-[#2E2E2E]" />
          )}
        </button>
        <button 
          onClick={handleStop} 
          className={`col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center ${!isStopped ? 'visible' : 'invisible'}`}
        >
          <Square size={10} className="text-[#2E2E2E] fill-[#2E2E2E]" />
        </button>
        <button onClick={onNext} className="col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center">
          <SkipForward size={12} className="text-[#2E2E2E]" />
        </button>
        <button className="col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center">
          <span className="text-[#2E2E2E] text-xs">⏏</span>
        </button>
        <button onClick={() => setShowShuffle(!showShuffle)} className={`col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center ${showShuffle ? 'border border-[#00FF00]' : ''}`}>
          <span className="text-[#2E2E2E] text-[10px]">S</span>
        </button>
        <button onClick={() => setShowRepeat(!showRepeat)} className={`col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center ${showRepeat ? 'border border-[#00FF00]' : ''}`}>
          <span className="text-[#2E2E2E] text-[10px]">R</span>
        </button>
        <button onClick={toggleMute} className="col-span-1 h-[18px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] flex items-center justify-center">
          {isMuted ? (
            <VolumeX size={12} className="text-[#2E2E2E]" />
          ) : (
            <Volume2 size={12} className="text-[#2E2E2E]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MainPlayer;