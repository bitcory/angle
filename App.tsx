import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewer3D } from './components/Viewer3D';
import { TopBar } from './components/TopBar';
import { CameraState, PromptParts } from './types';
import { RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for live data display
  const [cameraState, setCameraState] = useState<CameraState>({
    azimuth: 0,
    polar: Math.PI / 2, // 90 degrees (eye level)
    distance: 9 // 9 fits the 'long shot' range
  });

  // State for prompt generation
  const [promptParts, setPromptParts] = useState<PromptParts>({
    view: 'front view',
    angle: 'eye-level shot',
    framing: 'long shot',
    technical: '35mm lens'
  });

  // State for programmatic camera control (setting presets)
  const [targetCamera, setTargetCamera] = useState<Partial<CameraState> | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        // Reset to Front View (0), Eye-level (PI/2), Full Shot (9) upon upload
        setTargetCamera({
          azimuth: 0,
          polar: Math.PI / 2,
          distance: 9
        });
        // Close sidebar on mobile after upload
        setSidebarOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraUpdate = useCallback((newState: CameraState, newPrompt: PromptParts) => {
    setCameraState(newState);
    setPromptParts(newPrompt);
    // Reset target camera so manual controls work again immediately after a preset move completes
    // In a production app, you might want to wait for the tween to finish
  }, []);

  const handlePresetSelect = (preset: Partial<CameraState>) => {
    setTargetCamera(preset);
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans text-zinc-100">
      {/* Left Sidebar */}
      <Sidebar
        cameraState={cameraState}
        onUpload={handleUpload}
        onPresetSelect={handlePresetSelect}
        hasImage={!!imageSrc}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative h-full w-full">
        {/* Refresh Button - Top Right */}
        <button
          onClick={() => {
            setImageSrc(null);
            setTargetCamera({
              azimuth: 0,
              polar: Math.PI / 2,
              distance: 9
            });
          }}
          className="fixed top-4 right-4 z-50 p-3 rounded-full bg-zinc-900/90 backdrop-blur-md border border-zinc-700 shadow-lg hover:bg-zinc-800 transition-all active:scale-95"
          title="새로고침"
        >
          <RotateCcw size={20} className="text-zinc-300" />
        </button>

        {/* 3D Scene */}
        <Viewer3D
          imageSrc={imageSrc}
          onUpdate={handleCameraUpdate}
          targetCamera={targetCamera}
        />

        {/* Mobile Upload Overlay - shows when no image */}
        {!imageSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 md:hidden z-30">
            <label className="flex flex-col items-center justify-center w-[80vw] h-[60vh] max-w-[320px] max-h-[400px] rounded-2xl border-2 border-dashed border-zinc-600 bg-zinc-900/90 cursor-pointer active:bg-zinc-800 transition-colors">
              <svg className="w-12 h-12 mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-medium text-zinc-300 mb-1">이미지 업로드</span>
              <span className="text-sm text-zinc-500">탭하여 이미지 선택</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
        )}

        {/* Prompt Bar - Centered at bottom */}
        <TopBar parts={promptParts} />
      </div>
    </div>
  );
};

export default App;