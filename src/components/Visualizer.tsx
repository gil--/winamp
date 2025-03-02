import React, { useRef, useEffect, useState } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  currentSongId?: number;
}

type VisualizerPreset = 'Bars' | 'Lines' | 'Dots' | 'Oscilloscope';

const Visualizer: React.FC<VisualizerProps> = ({ audioRef, isPlaying, currentSongId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<VisualizerPreset>('Bars');

  // Reset visualization when song changes
  useEffect(() => {
    if (currentSongId !== undefined) {
      lastFrameRef.current = null;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [currentSongId]);

  // Initialize audio context after user interaction
  useEffect(() => {
    const initializeAudio = async () => {
      if (!audioRef.current) return;
      
      try {
        // Only create new audio context if one doesn't exist
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          
          const source = audioContextRef.current.createMediaElementSource(audioRef.current);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          
          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
        }

        // Always ensure the context is running
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        console.log('AudioContext state:', audioContextRef.current.state);
        setIsAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    // Initialize when playing starts
    if (isPlaying && !isAudioInitialized) {
      initializeAudio();
    }
  }, [isPlaying, isAudioInitialized, audioRef]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clean up audio context when component unmounts
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const cacheCurrentFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    lastFrameRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const restoreLastFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (lastFrameRef.current) {
      ctx.putImageData(lastFrameRef.current, 0, 0);
    }
  };

  const drawBars = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const barWidth = 2;
    const gap = 1;
    const bars = Math.min(Math.floor(canvas.width / (barWidth + gap)), dataArray.length);
    const step = Math.floor(dataArray.length / bars);
    
    for (let i = 0; i < bars; i++) {
      const dataIndex = i * step;
      const value = dataArray[dataIndex];
      const barHeight = (value / 255) * canvas.height;
      const x = i * (barWidth + gap);
      
      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#1EF04A');
      gradient.addColorStop(0.5, '#0CD02B');
      gradient.addColorStop(1, '#016A0B');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      const peakHeight = 1;
      ctx.fillStyle = '#3EFF6E';
      ctx.fillRect(x, canvas.height - barHeight - peakHeight - 1, barWidth, peakHeight);
    }
  };

  const drawLines = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    ctx.beginPath();
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    
    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 255.0;
      const y = (v * canvas.height);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawDots = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const dots = 32;
    const radius = 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < dots; i++) {
      const value = dataArray[i * 2] / 255.0;
      const angle = (i / dots) * Math.PI * 2;
      const distance = value * (Math.min(canvas.width, canvas.height) / 3);
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#3EFF6E');
      gradient.addColorStop(1, '#016A0B');
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawOscilloscope = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    ctx.beginPath();
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    
    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;
    
    ctx.moveTo(0, canvas.height / 2);
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    ctx.stroke();
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    switch (currentPreset) {
      case 'Bars':
        drawBars(ctx, canvas, dataArray);
        break;
      case 'Lines':
        drawLines(ctx, canvas, dataArray);
        break;
      case 'Dots':
        drawDots(ctx, canvas, dataArray);
        break;
      case 'Oscilloscope':
        drawOscilloscope(ctx, canvas, dataArray);
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas initially
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const visualize = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx) return;
      
      try {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // Draw the current frame
        drawFrame(ctx, canvas, dataArrayRef.current);
        
        // Cache the frame before requesting the next frame
        cacheCurrentFrame(ctx, canvas);
        
        // Only request next frame if still playing
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(visualize);
        }
      } catch (error) {
        console.error('Error in visualization:', error);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    };

    if (isPlaying && isAudioInitialized) {
      console.log('Starting visualization');
      visualize();
    } else {
      console.log('Pausing visualization');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // When pausing, restore the last cached frame
      if (lastFrameRef.current) {
        restoreLastFrame(ctx, canvas);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isAudioInitialized, currentPreset]);

  return (
    <div className="winamp-visualizer w-[275px] mt-1 select-none">
      <div className="winamp-title-bar flex justify-between items-center bg-[#2E2E2E] px-1 py-[2px] border-t border-[#4B4B4B] border-b border-b-[#000000]">
        <div className="flex items-center gap-1">
          <div className="h-[9px] w-[9px] bg-[#6B6B6B]"></div>
          <span className="text-[#D1D1FF] text-[8px] tracking-wider font-bold uppercase">Visualizer</span>
          <select
            value={currentPreset}
            onChange={(e) => setCurrentPreset(e.target.value as VisualizerPreset)}
            className="ml-2 bg-[#2E2E2E] text-[#00FF00] text-[8px] border border-[#4B4B4B] px-1"
          >
            <option value="Bars">Bars</option>
            <option value="Lines">Lines</option>
            <option value="Dots">Dots</option>
            <option value="Oscilloscope">Oscilloscope</option>
          </select>
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