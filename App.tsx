import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Viewer3D } from './components/Viewer3D';
import { TopBar } from './components/TopBar';
import { CameraState, PromptParts } from './types';

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
        {/* 3D Scene */}
        <Viewer3D
          imageSrc={imageSrc}
          onUpdate={handleCameraUpdate}
          targetCamera={targetCamera}
        />

        {/* Prompt Bar - Centered at bottom */}
        <TopBar parts={promptParts} />
      </div>
    </div>
  );
};

export default App;