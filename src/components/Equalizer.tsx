import React, { useState } from 'react';

interface EqualizerProps {
  onBandChange: (index: number, value: number) => void;
  onPresetChange?: (preset: string) => void;
}

const BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const PRESETS = ['Normal', 'Classical', 'Rock', 'Pop', 'Jazz', 'Dance', 'Full Bass', 'Full Treble'];

const Equalizer: React.FC<EqualizerProps> = ({ onBandChange, onPresetChange }) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isAuto, setIsAuto] = useState<boolean>(false);
  const [bands, setBands] = useState<number[]>(Array(11).fill(50)); // 11 bands including preamp
  const [showPresets, setShowPresets] = useState<boolean>(false);

  const handleBandChange = (index: number, value: number) => {
    const newBands = [...bands];
    newBands[index] = value;
    setBands(newBands);
    if (index > 0) { // Skip preamp
      onBandChange(index - 1, value);
    }
  };

  return (
    <div className="w-[275px] mt-1 select-none">
      {/* Title Bar with gradient */}
      <div className="flex justify-between items-center h-[20px] bg-gradient-to-r from-[#2E2E2E] via-[#4B4B4B] to-[#2E2E2E] px-2">
        <div className="flex items-center gap-2">
          <div className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B]"></div>
          <span className="text-[#D1D1FF] text-[10px] tracking-wider font-bold">WINAMP EQUALIZER</span>
        </div>
        <div className="flex gap-1">
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">_</button>
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">×</button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[#2E2E2E] p-2 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`h-[18px] px-3 text-[10px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] ${
              isEnabled ? 'border border-[#00FF00]' : ''
            }`}
          >
            ON
          </button>
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`h-[18px] px-3 text-[10px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] ${
              isAuto ? 'border border-[#00FF00]' : ''
            }`}
          >
            AUTO
          </button>
        </div>

        {/* EQ Graph */}
        <div className="flex-1 mx-4 h-[18px] bg-[#000000] border border-[#4B4B4B] relative">
          <div className="absolute top-1/2 w-full h-[1px] bg-[#333333]"></div>
          {bands.slice(1).map((value, index) => (
            <div
              key={index}
              className="absolute w-[2px] bg-[#FFFF00]"
              style={{
                left: `${(index + 1) * 9}%`,
                height: `${Math.abs(value - 50)}%`,
                bottom: value >= 50 ? '50%' : 'auto',
                top: value >= 50 ? 'auto' : '50%'
              }}
            ></div>
          ))}
        </div>

        <button
          onClick={() => setShowPresets(!showPresets)}
          className="h-[18px] px-3 text-[10px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B]"
        >
          PRESETS
        </button>
      </div>

      {/* Sliders Section */}
      <div className="bg-[#2E2E2E] p-4 flex justify-between">
        {/* Preamp Slider */}
        <div className="flex flex-col items-center">
          <span className="text-[#00FF00] text-[8px]">+12</span>
          <div className="relative h-[100px] w-[14px] bg-[#000000] border border-[#4B4B4B]">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-[#FFFF00]" 
              style={{ height: `${bands[0]}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={bands[0]}
              onChange={(e) => handleBandChange(0, parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [-webkit-appearance:slider-vertical]"
              disabled={!isEnabled}
            />
          </div>
          <span className="text-[#00FF00] text-[8px]">-12</span>
          <span className="text-[#00FF00] text-[8px] mt-1">PREAMP</span>
        </div>

        {/* EQ Band Sliders */}
        {BANDS.map((freq, index) => (
          <div key={freq} className="flex flex-col items-center">
            <span className="text-[#00FF00] text-[8px]">+12</span>
            <div className="relative h-[100px] w-[14px] bg-[#000000] border border-[#4B4B4B]">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-[#FFFF00]" 
                style={{ height: `${bands[index + 1]}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={bands[index + 1]}
                onChange={(e) => handleBandChange(index + 1, parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [-webkit-appearance:slider-vertical]"
                disabled={!isEnabled}
              />
            </div>
            <span className="text-[#00FF00] text-[8px]">-12</span>
            <span className="text-[#00FF00] text-[8px] mt-1">
              {freq >= 1000 ? `${freq / 1000}K` : freq}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;