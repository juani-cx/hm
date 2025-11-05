import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const MUSIC_TRACKS = [
  { id: 1, title: 'Summer Vibes', artist: 'Lo-Fi Beats' },
  { id: 2, title: 'Fashion Week', artist: 'Chill Hop' },
  { id: 3, title: 'Boutique Dreams', artist: 'Ambient Mix' },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);

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
    <div className="p-4 space-y-3">
      <div className="text-center">
        <p className="font-medium text-sm" data-testid="music-track-title">{track.title}</p>
        <p className="text-xs text-muted-foreground" data-testid="music-track-artist">{track.artist}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handlePrev}
          className="h-8 w-8"
          data-testid="button-music-prev"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="default"
          onClick={handlePlayPause}
          className="h-10 w-10"
          data-testid="button-music-play-pause"
        >
          {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleNext}
          className="h-8 w-8"
          data-testid="button-music-next"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={100}
          step={1}
          className="flex-1"
          data-testid="slider-music-volume"
        />
      </div>
    </div>
  );
}
