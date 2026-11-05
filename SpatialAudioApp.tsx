import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Sparkles, Radio, Disc3 } from 'lucide-react';
import { spatialAudio } from '../../services/spatialAudio';

export const SpatialAudioApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSoundscape, setActiveSoundscape] = useState<string>('nebula');
  const [volume, setVolume] = useState<number>(spatialAudio.getVolume());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const soundscapes = [
    {
      id: 'nebula',
      name: 'Cosmic Drift',
      subtitle: 'Harmonic 5th Drone',
      key: 'A Minor 110Hz',
    },
    {
      id: 'fjord',
      name: 'Glacial Fjord',
      subtitle: 'Nordic Dawn Mist',
      key: 'E Natural 82Hz',
    },
    {
      id: 'binaural',
      name: '432Hz Binaural',
      subtitle: 'Alpha Wave Resonance',
      key: '4Hz Delta Pulse',
    },
    {
      id: 'rain',
      name: 'Rain on Glass',
      subtitle: 'Acoustic White Drift',
      key: '800Hz Lowpass',
    },
  ] as const;

  // Start / Stop soundscape
  const togglePlay = () => {
    spatialAudio.playSpatialClick();
    if (isPlaying) {
      spatialAudio.stopSoundscape();
      setIsPlaying(false);
    } else {
      spatialAudio.startSoundscape(activeSoundscape as 'nebula' | 'fjord' | 'binaural' | 'rain');
      setIsPlaying(true);
    }
  };

  const handleSelectSoundscape = (id: 'nebula' | 'fjord' | 'binaural' | 'rain') => {
    spatialAudio.playSpatialClick();
    setActiveSoundscape(id);
    if (isPlaying) {
      spatialAudio.startSoundscape(id);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    spatialAudio.setVolume(v);
  };

  // Real-time Canvas Spectrum Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = spatialAudio.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle resting wave
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.003 + i * 0.3) * 12 + 14;
        }
      }

      const barWidth = (width / bufferLength) * 0.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * height * 0.85;

        // Gradient for glass glow bars
        const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.7)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.9)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        // Specular dot cap
        if (barHeight > 4) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, height - barHeight - 2, barWidth, 1.5);
        }

        x += barWidth + 3;
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="space-y-4 text-sm">
      {/* Visual Album Hero Card */}
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-lg group">
          <img
            src="/src/assets/images/spatial_audio_artwork_1793900276543.jpg"
            alt="Spatial Audio Generative Artwork"
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay animate-pulse" />
          )}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white drop-shadow-md" />
            ) : (
              <Play className="w-8 h-8 text-white drop-shadow-md fill-white ml-1" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>3D BINAURAL FIELD</span>
          </div>
          <h3 className="text-base font-semibold text-white truncate mt-0.5">
            {soundscapes.find((s) => s.id === activeSoundscape)?.name}
          </h3>
          <p className="text-xs text-slate-400 truncate">
            {soundscapes.find((s) => s.id === activeSoundscape)?.subtitle}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              {soundscapes.find((s) => s.id === activeSoundscape)?.key}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {isPlaying ? 'Streaming Synthesizer' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Spectrum Analyzer */}
      <div className="p-3 rounded-xl bg-black/40 border border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Harmonic Glass Spectrum (FFT 64)
          </span>
          <span className="font-mono text-[10px] text-slate-500">20Hz - 20kHz</span>
        </div>
        <canvas
          ref={canvasRef}
          width={480}
          height={64}
          className="w-full h-16 rounded bg-black/20 block"
        />
      </div>

      {/* Soundscape Presets */}
      <div>
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Disc3 className="w-3.5 h-3.5 text-indigo-400" />
          Atmospheric Synthesizer Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {soundscapes.map((s) => {
            const isCurrent = activeSoundscape === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectSoundscape(s.id as 'nebula' | 'fjord' | 'binaural' | 'rain')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-500/20 border-indigo-400/60 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <div className="font-medium text-xs truncate">{s.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spatial Master Volume */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Spatial Attenuation</span>
            <span className="font-mono tabular-nums text-cyan-300">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
