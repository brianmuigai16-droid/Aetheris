import React, { useState } from 'react';
import { FolderArchive, FileCode, Music, Box, Image as ImageIcon, ExternalLink, Download, Check } from 'lucide-react';
import { spatialAudio } from '../../services/spatialAudio';

interface SpatialFile {
  id: string;
  name: string;
  type: '3d' | 'audio' | 'shader' | 'hdr' | 'json';
  size: string;
  date: string;
  description: string;
}

export const FileVaultApp: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>('f1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const files: SpatialFile[] = [
    {
      id: 'f1',
      name: 'Quantum_Crystal_Mesh.gltf',
      type: '3d',
      size: '14.2 MB',
      date: 'Today · 09:30',
      description: 'Parametric crystal geometry with precomputed ambient occlusion and transmission vertex attributes.',
    },
    {
      id: 'f2',
      name: 'Binaural_Pulse_432.spatial',
      type: 'audio',
      size: '8.4 MB',
      date: 'Yesterday',
      description: 'Multi-channel spatial audio impulse response for simulated acoustic glass concert rooms.',
    },
    {
      id: 'f3',
      name: 'Fresnel_Dispersion_Shader.wgsl',
      type: 'shader',
      size: '42 KB',
      date: 'Oct 28',
      description: 'High-performance WebGPU compute and fragment shader simulating chromatic glass dispersion.',
    },
    {
      id: 'f4',
      name: 'Deep_Nebula_Environment.hdr',
      type: 'hdr',
      size: '32.1 MB',
      date: 'Oct 24',
      description: '32-bit floating point high dynamic range equirectangular panorama captured in deep space.',
    },
    {
      id: 'f5',
      name: 'Glass_Physical_Tokens.json',
      type: 'json',
      size: '18 KB',
      date: 'Oct 19',
      description: 'Calibrated refraction indices (IOR 1.45–1.62) and specular attenuation curves for Aetheris OS.',
    },
  ];

  const getIcon = (type: SpatialFile['type']) => {
    switch (type) {
      case '3d':
        return <Box className="w-4 h-4 text-cyan-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-indigo-400" />;
      case 'shader':
        return <FileCode className="w-4 h-4 text-emerald-400" />;
      case 'hdr':
        return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'json':
        return <FolderArchive className="w-4 h-4 text-pink-400" />;
    }
  };

  const handleExport = (file: SpatialFile) => {
    spatialAudio.playGlassChime(2200, 0.25);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeFile = files.find((f) => f.id === selectedFileId) || files[0];

  return (
    <div className="space-y-3 flex flex-col h-full text-sm">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
          Spatial File Artifacts
        </label>
        <span className="text-[10px] text-slate-400 font-mono">5 Anchored Files</span>
      </div>

      {/* Files List */}
      <div className="space-y-1.5 flex-1 overflow-auto custom-scrollbar">
        {files.map((file) => {
          const isSelected = file.id === selectedFileId;
          return (
            <div
              key={file.id}
              onClick={() => {
                spatialAudio.playSpatialClick();
                setSelectedFileId(file.id);
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400/50 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                  {getIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-xs truncate text-white">{file.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    <span>{file.size}</span>
                    <span className="mx-1">·</span>
                    <span>{file.date}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport(file);
                }}
                title="Download / Export Artifact"
                className="p-1.5 rounded-lg glass-control text-slate-400 hover:text-white"
              >
                {copiedId === file.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected File Inspection Inspector Card */}
      {activeFile && (
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white truncate max-w-[200px] flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              {activeFile.name}
            </span>
            <span className="text-[10px] font-mono text-amber-300">{activeFile.size}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{activeFile.description}</p>
        </div>
      )}
    </div>
  );
};
