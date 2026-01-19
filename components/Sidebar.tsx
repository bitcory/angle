import React, { useRef, PropsWithChildren } from 'react';
import { CameraState } from '../types';
import { Upload, X, Settings2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  cameraState: CameraState;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPresetSelect: (preset: Partial<CameraState>) => void;
  hasImage: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const ButtonGroup = ({ children }: PropsWithChildren) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {children}
  </div>
);

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
}

const ControlButton = ({ 
  active, 
  onClick, 
  children 
}: PropsWithChildren<ControlButtonProps>) => (
  <button
    onClick={onClick}
    className={clsx(
      "px-3 py-2 text-xs font-medium rounded transition-colors flex-1 min-w-[80px] text-center",
      active 
        ? "bg-blue-600 text-white" 
        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
    )}
  >
    {children}
  </button>
);

const Slider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  labels 
}: { 
  min: number; 
  max: number; 
  value: number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  labels: { left: string; center?: string; right: string } 
}) => (
  <div className="mb-6">
    <input
      type="range"
      min={min}
      max={max}
      step="1"
      value={value}
      onChange={onChange}
      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
    <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium">
      <span>{labels.left}</span>
      {labels.center && <span>{labels.center}</span>}
      <span>{labels.right}</span>
    </div>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ cameraState, onUpload, onPresetSelect, hasImage, isOpen, onToggle }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Converters ---
  const toDeg = (rad: number) => Math.round((rad * 180) / Math.PI);
  
  // Azimuth: 0-360 for slider
  // Three.js azimuth: 0 is Z+ (Front). 
  // We want to map this to 0-360 range where 0 is Front, 180 is Back.
  // Normalize to 0-2PI
  const currentAzimuthDeg = (toDeg(cameraState.azimuth) % 360 + 360) % 360;

  // Polar: Three.js 0(Top) to 180(Bottom).
  // UI wants: -90(Low) to 90(High).
  // Eye level (90 polar) = 0 UI.
  // High angle (small polar) = +90 UI.
  // Low angle (large polar) = -90 UI.
  // UI Value = 90 - PolarDeg
  const currentPolarDeg = toDeg(cameraState.polar);
  const uiVerticalValue = 90 - currentPolarDeg;

  // Distance: Direct mapping
  const currentDist = cameraState.distance;

  // --- Handlers ---
  const handleAzimuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onPresetSelect({ azimuth: (val * Math.PI) / 180 });
  };

  const handleVerticalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    // UI val 90 -> Polar 0. UI val -90 -> Polar 180.
    // Polar = 90 - UI val
    onPresetSelect({ polar: ((90 - val) * Math.PI) / 180 });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onPresetSelect({ distance: val });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className={clsx(
          "fixed top-4 left-4 z-[60] p-3 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700 shadow-lg md:hidden transition-all",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Settings2 size={20} className="text-zinc-300" />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed md:relative z-50 h-full bg-[#121214] border-r border-zinc-800 flex flex-col p-4 md:p-5 overflow-y-auto select-none transition-transform duration-300 ease-in-out",
        "w-72 md:w-72 lg:w-80",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* Mobile Close Button */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 transition-colors md:hidden"
        >
          <X size={20} className="text-zinc-400" />
        </button>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[3/4] mb-6 md:mb-8 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-colors flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group mt-8 md:mt-0"
        >
          {hasImage ? (
             <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)' }} />
          ) : null}
          <div className="z-10 flex flex-col items-center text-zinc-500 group-hover:text-zinc-300">
            <Upload size={20} className="mb-2" />
            <span className="text-xs">이미지 업로드</span>
          </div>
          <input type="file" ref={fileInputRef} onChange={onUpload} className="hidden" accept="image/*" />
        </div>

      {/* HORIZONTAL Control */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-xs md:text-sm font-bold text-zinc-300 mb-3 md:mb-4">수평 (HORIZONTAL)</h3>
        
        <ButtonGroup>
          <ControlButton 
            active={currentAzimuthDeg >= 355 || currentAzimuthDeg <= 5} 
            onClick={() => onPresetSelect({ azimuth: 0 })}
          >
            전면
          </ControlButton>
          <ControlButton 
            active={currentAzimuthDeg >= 40 && currentAzimuthDeg <= 50} 
            onClick={() => onPresetSelect({ azimuth: Math.PI / 4 })}
          >
            좌측 전방
          </ControlButton>
          <ControlButton 
            active={currentAzimuthDeg >= 85 && currentAzimuthDeg <= 95} 
            onClick={() => onPresetSelect({ azimuth: Math.PI / 2 })}
          >
            좌측
          </ControlButton>
          <ControlButton 
            active={currentAzimuthDeg >= 310 && currentAzimuthDeg <= 320} 
            onClick={() => onPresetSelect({ azimuth: -Math.PI / 4 })}
          >
            우측 전방
          </ControlButton>
          <ControlButton 
            active={currentAzimuthDeg >= 265 && currentAzimuthDeg <= 275} 
            onClick={() => onPresetSelect({ azimuth: -Math.PI / 2 })}
          >
            우측
          </ControlButton>
        </ButtonGroup>

        <Slider 
          min={0} 
          max={360} 
          value={currentAzimuthDeg} 
          onChange={handleAzimuthChange}
          labels={{ left: '0°', center: '180°', right: '360°' }}
        />
      </div>

      {/* VERTICAL Control */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-xs md:text-sm font-bold text-zinc-300 mb-3 md:mb-4">수직 (VERTICAL)</h3>
        
        <ButtonGroup>
          <ControlButton 
            active={uiVerticalValue > 20} 
            onClick={() => onPresetSelect({ polar: Math.PI / 3 })} // 60 deg polar = +30 UI (High)
          >
            하이 앵글
          </ControlButton>
          <ControlButton 
            active={Math.abs(uiVerticalValue) <= 10} 
            onClick={() => onPresetSelect({ polar: Math.PI / 2 })}
          >
            아이 레벨
          </ControlButton>
          <ControlButton 
            active={uiVerticalValue < -20} 
            onClick={() => onPresetSelect({ polar: (2 * Math.PI) / 3 })} // 120 deg polar = -30 UI (Low)
          >
            로우 앵글
          </ControlButton>
        </ButtonGroup>

        <Slider 
          min={-90} 
          max={90} 
          value={uiVerticalValue} 
          onChange={handleVerticalChange}
          labels={{ left: '로우 (-90°)', center: '아이 (0°)', right: '하이 (90°)' }}
        />
      </div>

      {/* DISTANCE Control */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-xs md:text-sm font-bold text-zinc-300 mb-3 md:mb-4">거리 (DISTANCE)</h3>
        
        <ButtonGroup>
          <ControlButton 
            active={currentDist < 4} 
            onClick={() => onPresetSelect({ distance: 3 })}
          >
            클로즈업
          </ControlButton>
          <ControlButton 
            active={currentDist >= 4 && currentDist < 8} 
            onClick={() => onPresetSelect({ distance: 6 })}
          >
            미디엄 샷
          </ControlButton>
          <ControlButton 
            active={currentDist >= 8} 
            onClick={() => onPresetSelect({ distance: 9 })}
          >
            풀 샷
          </ControlButton>
        </ButtonGroup>

        <Slider
          min={2}
          max={15}
          value={currentDist}
          onChange={handleDistanceChange}
          labels={{ left: '가까움', right: '멀음' }}
        />
      </div>

      </div>
    </>
  );
};