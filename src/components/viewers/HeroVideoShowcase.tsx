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

  const isPortrait = video.height > video.width;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-[#050608] select-none"
    >
      {/* Fondo ambiental difuminado para eliminar franjas negras en cualquier relación de aspecto */}
      {blobUrl && !isFullscreen && (
        <video
          src={blobUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 transform-gpu object-cover opacity-40 blur-2xl saturate-125 will-change-transform"
        />
      )}

      {/* Velo sutil de contraste + acento radial CADCO */}
      <div className="pointer-events-none absolute inset-0 bg-[#050608]/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(91,181,185,0.10)_0%,transparent_72%)]" />

      {/* Video principal limpio sin texto ni badges */}
      {blobUrl && (
        <div
          onClick={togglePlay}
          className={
            isFullscreen
              ? 'relative z-10 flex h-full w-full items-center justify-center'
              : isPortrait
                ? 'relative z-10 flex h-[90%] max-w-[88%] items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.75)]'
                : 'relative z-10 flex h-full w-full items-center justify-center'
          }
        >
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
            className={
              isFullscreen
                ? 'h-full w-full transform-gpu object-contain will-change-transform'
                : isPortrait
                  ? 'h-full w-auto max-w-full transform-gpu object-contain will-change-transform'
                  : 'h-full w-full transform-gpu object-cover will-change-transform'
            }
          />
        </div>
      )}

      {/* Cápsula de controles minimalista: oculta por defecto, visible al pasar el cursor */}
      <div className="absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-full border border-white/15 bg-black/55 p-1 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar video' : 'Reproducir video'}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 hover:text-[#5bb5b9]"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activar audio' : 'Silenciar audio'}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 hover:text-[#5bb5b9]"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={handleFullscreen}
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 hover:text-[#5bb5b9]"
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
