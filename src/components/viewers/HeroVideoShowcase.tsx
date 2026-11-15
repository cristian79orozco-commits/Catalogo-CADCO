import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { HeroVideoFile } from '../../types';

interface HeroVideoShowcaseProps {
  video: HeroVideoFile;
}

function dataUrlToBlobUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return dataUrl;
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'video/webm';
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({ video }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const blobUrl = useMemo(() => dataUrlToBlobUrl(video.dataUrl), [video.dataUrl]);

  useEffect(() => {
    return () => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

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
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const wrapper = containerRef.current;
    if (wrapper?.requestFullscreen) {
      void wrapper.requestFullscreen();
    }
  };

  const formatLabel = video.mimeType.includes('webm') ? 'WEBM' : 'MP4';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative h-full w-full overflow-hidden bg-[#070a0f] select-none"
    >
      {blobUrl && (
        <video
          ref={videoRef}
          src={blobUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          controls={false}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onCanPlay={(e) => {
            if (isPlaying && e.currentTarget.paused) {
              void e.currentTarget.play().catch(() => {});
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full transform-gpu object-contain will-change-transform"
        />
      )}

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
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/75 text-slate-200 backdrop-blur-sm transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};
