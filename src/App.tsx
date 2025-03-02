import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import MainPlayer from './components/MainPlayer';
import Equalizer from './components/Equalizer';
import Playlist from './components/Playlist';
import Visualizer from './components/Visualizer';
import { songs } from './data/songs';
import './index.css';

function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [equalizerBands, setEqualizerBands] = useState<number[]>(Array(10).fill(0));
  const [volume, setVolume] = useState<number>(1.0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerNodeRef = useRef(null);
  const equalizerNodeRef = useRef(null);
  const playlistNodeRef = useRef(null);
  const visualizerNodeRef = useRef(null);

  const currentSong = songs[currentSongIndex];

  // Debug logging for currentSong
  useEffect(() => {
    console.log('Current song in App:', currentSong);
  }, [currentSong]);

  // Reset audio when song changes
  useEffect(() => {
    if (audioRef.current) {
      // Reset current time when changing songs
      setCurrentTime(0);
      audioRef.current.currentTime = 0;
      
      // Load the new song
      audioRef.current.load();
      
      // Play if isPlaying is true
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (!isPlaying) {
        audioRef.current.play()
          .then(() => {
            console.log("Successfully started playback");
            setIsPlaying(true);
          })
          .catch(error => {
            console.error("Error in play():", error);
            setIsPlaying(false);
          });
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handlePrev = () => {
    setCurrentSongIndex(prev => (prev === 0 ? songs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSongIndex(prev => (prev === songs.length - 1 ? 0 : prev + 1));
  };

  const handleSelectSong = (id: number) => {
    const index = songs.findIndex(song => song.id === id);
    if (index !== -1) {
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...equalizerBands];
    newBands[index] = value;
    setEqualizerBands(newBands);
    
    // In a real implementation, this would adjust the audio equalization
    // We would need a Web Audio API with BiquadFilterNode for each band
  };

  const handleEnded = () => {
    handleNext();
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      // Set initial volume
      audioRef.current.volume = volume;
      console.log('Current volume:', audioRef.current.volume);
      
      // Add error event listener
      const handleAudioError = (e: ErrorEvent) => {
        console.error("Detailed audio error:", {
          error: e.error,
          message: e.message,
          type: e.type
        });
      };

      const handleVolumeChange = () => {
        console.log('Volume changed to:', audioRef.current?.volume);
      };

      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('volumechange', handleVolumeChange);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('error', handleAudioError);
          audioRef.current.removeEventListener('volumechange', handleVolumeChange);
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#3B5999] flex items-center justify-center p-4">
      <audio
        ref={audioRef}
        src={currentSong.url}
        crossOrigin="anonymous"
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          const error = e.currentTarget.error;
          console.error("Audio error:", {
            code: error?.code,
            message: error?.message,
            networkState: e.currentTarget.networkState,
            readyState: e.currentTarget.readyState,
            currentSrc: e.currentTarget.currentSrc,
            volume: e.currentTarget.volume,
            muted: e.currentTarget.muted
          });
        }}
        onLoadStart={() => console.log("Started loading:", currentSong.url)}
        onCanPlay={() => {
          console.log("Can play:", currentSong.url, {
            volume: audioRef.current?.volume,
            muted: audioRef.current?.muted,
            readyState: audioRef.current?.readyState
          });
        }}
        onPlay={() => console.log("Playing:", currentSong.url)}
        onPlaying={() => console.log("Playback is actively playing", {
          volume: audioRef.current?.volume,
          currentTime: audioRef.current?.currentTime
        })}
      />
      
      <div className="winamp-container flex flex-col md:flex-row items-start gap-4">
        <div className="winamp-left-column">
          <Draggable bounds="parent" handle=".winamp-title-bar" nodeRef={playerNodeRef}>
            <div ref={playerNodeRef}>
              <MainPlayer
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onPrev={handlePrev}
                onNext={handleNext}
                audioRef={audioRef}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
              />
            </div>
          </Draggable>
          
          <Draggable bounds="parent" handle=".winamp-title-bar" nodeRef={equalizerNodeRef}>
            <div ref={equalizerNodeRef}>
              <Equalizer onBandChange={handleBandChange} />
            </div>
          </Draggable>
          
          <Draggable bounds="parent" handle=".winamp-title-bar" nodeRef={playlistNodeRef}>
            <div ref={playlistNodeRef}>
              <Playlist
                songs={songs}
                currentSongId={currentSong?.id ?? null}
                onSelectSong={handleSelectSong}
              />
            </div>
          </Draggable>
        </div>
        
        <div className="winamp-right-column">
          <Draggable bounds="parent" handle=".winamp-title-bar" nodeRef={visualizerNodeRef}>
            <div ref={visualizerNodeRef}>
              <Visualizer 
                audioRef={audioRef} 
                isPlaying={isPlaying}
                currentSongId={currentSong?.id}
              />
            </div>
          </Draggable>
        </div>
      </div>
    </div>
  );
}

export default App;