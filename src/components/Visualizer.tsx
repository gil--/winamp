import React, { useRef, useEffect, useState } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Initialize audio context after user interaction
  useEffect(() => {
    if (isPlaying && !isAudioInitialized && audioRef.current) {
      const initializeAudio = () => {
        if (!audioRef.current) return;
        
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          
          const source = audioContextRef.current.createMediaElementSource(audioRef.current);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          
          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
          
          // Resume the audio context
          audioContextRef.current.resume().then(() => {
            console.log('AudioContext started successfully');
            setIsAudioInitialized(true);
          });
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
      };

      initializeAudio();
    }
  }, [isPlaying, isAudioInitialized, audioRef]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // In a real app, you might want to close the audio context when component unmounts
        // audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current || !isAudioInitialized) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const visualize = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;
      
      animationRef.current = requestAnimationFrame(visualize);
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Clear canvas with classic Winamp black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization with classic Winamp style
      const barWidth = 2; // Classic Winamp had thin bars
      const gap = 1; // Small gap between bars
      const bars = Math.min(Math.floor(canvas.width / (barWidth + gap)), dataArrayRef.current.length);
      const step = Math.floor(dataArrayRef.current.length / bars);
      
      for (let i = 0; i < bars; i++) {
        const dataIndex = i * step;
        const value = dataArrayRef.current[dataIndex];
        const barHeight = (value / 255) * canvas.height;
        const x = i * (barWidth + gap);
        
        // Classic Winamp green gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#1EF04A'); // Bright green at top
        gradient.addColorStop(0.5, '#0CD02B'); // Mid green
        gradient.addColorStop(1, '#016A0B'); // Dark green at bottom
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        // Add peak marker (characteristic of Winamp)
        const peakHeight = 1;
        ctx.fillStyle = '#3EFF6E';
        ctx.fillRect(x, canvas.height - barHeight - peakHeight - 1, barWidth, peakHeight);
      }
    };

    if (isPlaying) {
      visualize();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      
      // Clear canvas when not playing
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isAudioInitialized]);

  return (
    <div className="winamp-visualizer w-[275px] mt-1 select-none">
      <div className="winamp-title-bar flex justify-between items-center bg-[#2E2E2E] px-1 py-[2px] border-t border-[#4B4B4B] border-b border-b-[#000000]">
        <div className="flex items-center gap-1">
          <div className="h-[9px] w-[9px] bg-[#6B6B6B]"></div>
          <span className="text-[#D1D1FF] text-[8px] tracking-wider font-bold uppercase">Visualizer</span>
        </div>
        <div className="flex gap-[2px]">
          <button className="winamp-button h-[9px] w-[9px] text-[8px] leading-[9px] bg-[#6B6B6B] hover:bg-[#8B8B8B] text-black font-bold flex items-center justify-center">_</button>
          <button className="winamp-button h-[9px] w-[9px] text-[8px] leading-[9px] bg-[#6B6B6B] hover:bg-[#8B8B8B] text-black font-bold flex items-center justify-center">×</button>
        </div>
      </div>
      
      <div className="winamp-visualizer-content bg-black border-l border-l-[#4B4B4B] border-r border-r-[#4B4B4B] border-b border-b-[#4B4B4B]">
        <canvas 
          ref={canvasRef} 
          width={275} 
          height={150}
          className="w-full h-[150px]"
        ></canvas>
      </div>
    </div>
  );
};

export default Visualizer;