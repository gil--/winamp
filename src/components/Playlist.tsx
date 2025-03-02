import React, { useState, useEffect } from 'react';
import { PlaylistItem } from '../types';
import { ChevronDown, ChevronUp, Plus, Minus, List, MoreHorizontal } from 'lucide-react';

interface PlaylistProps {
  songs: PlaylistItem[];
  currentSongId: number | null;
  onSelectSong: (id: number) => void;
}

const Playlist: React.FC<PlaylistProps> = ({ songs, currentSongId, onSelectSong }) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const totalTime = songs.reduce((acc, song) => acc + song.lengthSeconds, 0);
  
  // Debug logging for currentSongId
  useEffect(() => {
    console.log('Current song ID in Playlist:', currentSongId);
  }, [currentSongId]);

  const formatTotalTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const truncateText = (text: string, maxLength: number = 40): string => {
    return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
  };

  const toggleSelection = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = new Set(selectedItems);
    if (selectedItems.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  return (
    <div className="w-[275px] mt-1 select-none">
      {/* Title Bar with gradient */}
      <div className="flex justify-between items-center h-[20px] bg-gradient-to-r from-[#2E2E2E] via-[#4B4B4B] to-[#2E2E2E] px-2">
        <div className="flex items-center gap-2">
          <div className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B]"></div>
          <span className="text-[#D1D1FF] text-[10px] tracking-wider font-bold">WINAMP PLAYLIST EDITOR</span>
        </div>
        <div className="flex gap-1">
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">_</button>
          <button className="w-[9px] h-[9px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] text-[8px] leading-[9px] text-black">×</button>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="bg-[#2E2E2E] p-1">
        <div className="h-[232px] bg-[#000000] overflow-y-auto winamp-playlist-content">
          {songs.map((song, index) => {
            const isCurrentSong = currentSongId === song.id;
            const isSelected = selectedItems.has(song.id);
            
            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song.id)}
                className={`flex justify-between items-center px-2 py-[2px] text-[10px] cursor-pointer
                  ${index % 2 === 0 ? 'bg-[#000000]' : 'bg-[#0A0A0A]'}
                  ${isSelected ? 'bg-[#2A4480]' : 'hover:bg-[#224488]'}
                  group transition-colors duration-75`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`w-4 ${isSelected ? 'text-white' : 'text-[#00FF00] opacity-70'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span 
                    onDoubleClick={(e) => toggleSelection(song.id, e)}
                    className={`cursor-pointer whitespace-pre
                      ${isCurrentSong ? 'text-[#4CFF4C] font-bold' : 'text-[#00FF00]'}
                      ${isSelected ? '!text-white' : 'group-hover:text-white'}
                      hover:underline`}
                    title={`${song.artist} - ${song.title}`}
                  >
                    {truncateText(`${song.artist} - ${song.title}`)}
                  </span>
                </div>
                <span className={`pl-2 ${isSelected ? 'text-white' : 'text-[#00FF00] opacity-70 group-hover:text-white'}`}>
                  {song.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#2E2E2E] p-2 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="h-[18px] w-[22px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] active:from-[#5B5B5B] active:to-[#3B3B3B] flex items-center justify-center">
            <Plus size={12} className="text-[#2E2E2E]" />
          </button>
          <button className="h-[18px] w-[22px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] active:from-[#5B5B5B] active:to-[#3B3B3B] flex items-center justify-center">
            <Minus size={12} className="text-[#2E2E2E]" />
          </button>
          <button className="h-[18px] w-[22px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] active:from-[#5B5B5B] active:to-[#3B3B3B] flex items-center justify-center">
            <List size={12} className="text-[#2E2E2E]" />
          </button>
          <button className="h-[18px] w-[22px] bg-gradient-to-br from-[#6B6B6B] to-[#4B4B4B] hover:from-[#8B8B8B] hover:to-[#6B6B6B] active:from-[#5B5B5B] active:to-[#3B3B3B] flex items-center justify-center">
            <MoreHorizontal size={12} className="text-[#2E2E2E]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#00FF00] font-mono text-[10px]">{songs.length} items</span>
          <span className="text-[#00FF00] font-mono text-[10px]">{formatTotalTime(totalTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default Playlist;