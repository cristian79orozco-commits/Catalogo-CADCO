import React, { useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { HeroVideoFile } from '../../types';

interface HeroVideoShowcaseProps {
  video: HeroVideoFile;
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setIsPlaying(true);
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  };

  const handleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      void el.requestFullscreen();
    }
  };

  const formatLabel = video.mimeType.includes('webm') ? 'WEBM' : 'MP4';

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070a0f]">
      <video
        ref={videoRef}
        src={video.dataUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-contain"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg border border-white/15 bg-black/75 px-2.5 py-1 font-mono-tech text-[10px] text-[#5bb5b9] backdrop-blur-sm sm:text-[11px]">
        {formatLabel} · {video.width}×{video.height}
      </div>

      <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/75 text-slate-200 backdrop-blur-sm transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activar audio' : 'Silenciar audio'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/75 text-slate-200 backdrop-blur-sm transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleFullscreen}
          aria-label="Pantalla completa"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/75 text-slate-200 backdrop-blur-sm transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
