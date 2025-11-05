import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MUSIC_TRACKS = [
  { id: 1, title: 'Summer Vibes', artist: 'Lo-Fi Beats' },
  { id: 2, title: 'Fashion Week', artist: 'Chill Hop' },
  { id: 3, title: 'Boutique Dreams', artist: 'Ambient Mix' },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % MUSIC_TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);
  };

  const track = MUSIC_TRACKS[currentTrack];

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={handlePrev}
        className="h-7 w-7 flex-shrink-0"
        data-testid="button-music-prev"
      >
        <SkipBack className="w-3.5 h-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handlePlayPause}
        className="h-7 w-7 flex-shrink-0"
        data-testid="button-music-play-pause"
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" fill="currentColor" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={handleNext}
        className="h-7 w-7 flex-shrink-0"
        data-testid="button-music-next"
      >
        <SkipForward className="w-3.5 h-3.5" />
      </Button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" data-testid="music-track-title">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate" data-testid="music-track-artist">{track.artist}</p>
      </div>
    </div>
  );
}
