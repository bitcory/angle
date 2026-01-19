
export interface CameraState {
  azimuth: number; // Horizontal rotation (radians)
  polar: number;   // Vertical rotation (radians)
  distance: number; // Distance from target
}

export interface PromptParts {
  view: string;      // e.g., "Front View", "Side Profile"
  angle: string;     // e.g., "High Angle", "Eye Level"
  framing: string;   // e.g., "Close-up", "Long Shot"
  technical: string; // e.g., "f/1.8", "85mm" (simulated based on distance)
}

export interface AppState {
  imageSrc: string | null;
  cameraState: CameraState;
  promptParts: PromptParts;
}

export const PRESETS = {
  FRONT: { azimuth: 0, polar: Math.PI / 2, distance: 9 },
  SIDE: { azimuth: -Math.PI / 2, polar: Math.PI / 2, distance: 5 },
  TOP: { azimuth: 0, polar: 0.1, distance: 8 }, 
  ISO: { azimuth: Math.PI / 4, polar: Math.PI / 3, distance: 7 },
};