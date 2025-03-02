export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
  url: string;
  lengthSeconds: number;  // Required for Song since we always have this data
}

export interface PlaylistItem {
  id: number;
  title: string;
  artist: string;
  duration: string;
  url: string;
  lengthSeconds: number;  // Required for PlaylistItem to match Song interface
}

export interface EqualizerBand {
  frequency: string;
  value: number;
}