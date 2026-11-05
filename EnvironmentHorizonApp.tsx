import React from 'react';
import { Compass, Sun, Eye, Sliders, Check } from 'lucide-react';
import { spatialAudio } from '../../services/spatialAudio';

export interface EnvironmentConfig {
  presetId: 'nebula' | 'fjord' | 'atelier' | 'void';
  brightness: number;
  blur: number;
  showVignette: boolean;
}

interface EnvironmentHorizonAppProps {
  envConfig: EnvironmentConfig;
  onUpdateConfig: (newConfig: Partial<EnvironmentConfig>) => void;
}

export const EnvironmentHorizonApp: React.FC<EnvironmentHorizonAppProps> = ({
  envConfig,
  onUpdateConfig,
}) => {
  const presets = [
    {
      id: 'nebula',
      name: 'Deep Celestial Nebula',
      subtitle: 'Cosmic dust & indigo starfields',
      image: '/src/assets/images/bg_env_deep_nebula_1793900276096.jpg',
      themeColor: '#818cf8',
    },
    {
      id: 'fjord',
      name: 'Nordic Fjord Dawn',
      subtitle: 'Glacial water & morning alpine mist',
      image: '/src/assets/images/bg_env_nordic_fjord_1793900276921.jpg',
      themeColor: '#38bdf8',
    },
    {
      id: 'atelier',
      name: 'Cyber Glass Atelier',
      subtitle: 'Twilight penthouse city skyline',
      image: '/src/assets/images/bg_env_cyber_atelier_1793900277539.jpg',
      themeColor: '#fbbf24',
    },
    {
      id: 'void',
      name: 'Deep Obsidian Void',
      subtitle: 'Pure dark spatial studio backdrop',
      image: '',
      themeColor: '#64748b',
    },
  ] as const;

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Spatial Environment Horizons
          </label>
          <span className="text-[10px] text-slate-400 font-mono">Panoramic 8K</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presets.map((preset) => {
            const isSelected = envConfig.presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  spatialAudio.playSpatialClick();
                  onUpdateConfig({ presetId: preset.id });
                }}
                className={`relative group rounded-xl overflow-hidden border text-left p-3 transition-all ${
                  isSelected
                    ? 'border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.3)]'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                {/* Background image preview */}
                {preset.image ? (
                  <img
                    src={preset.image}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-950 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-1">{preset.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Atmospheric Tuning */}
      <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Atmospheric Photometrics
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Calibrated</span>
        </div>

        {/* Horizon Brightness */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              Horizon Exposure
            </span>
            <span className="font-mono tabular-nums text-amber-300">
              {Math.round(envConfig.brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={envConfig.brightness}
            onChange={(e) => onUpdateConfig({ brightness: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Environmental Blur */}
        <div>
          <div className="flex justify-between text-xs mb-1 text-slate-300">
            <span>Atmospheric Depth Diffusion</span>
            <span className="font-mono tabular-nums text-slate-400">{envConfig.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={envConfig.blur}
            onChange={(e) => onUpdateConfig({ blur: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-white/20 rounded-lg accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Vignette Toggle */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-slate-400" />
            Spatial Vignette Scrim
          </span>
          <button
            onClick={() => {
              spatialAudio.playSpatialClick();
              onUpdateConfig({ showVignette: !envConfig.showVignette });
            }}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              envConfig.showVignette ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                envConfig.showVignette ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
