import { PromptParts } from '../types';

/**
 * deeply considers the relationship between spherical coordinates and 
 * cinematographic language to return precise prompt fragments.
 */
export const calculatePrompt = (azimuth: number, polar: number, distance: number): PromptParts => {
  // 1. Calculate View (Horizontal / Azimuth)
  // Normalize azimuth to 0 - 2PI range for easier calculation
  let az = azimuth % (2 * Math.PI);
  if (az < 0) az += 2 * Math.PI;
  
  // Convert radians to degrees for easier mental mapping
  const azDeg = (az * 180) / Math.PI;
  
  let view = "front view";
  
  if (azDeg >= 337.5 || azDeg < 22.5) view = "front view";
  else if (azDeg >= 22.5 && azDeg < 67.5) view = "front-right three-quarter view";
  else if (azDeg >= 67.5 && azDeg < 112.5) view = "right side profile";
  else if (azDeg >= 112.5 && azDeg < 157.5) view = "back-right three-quarter view";
  else if (azDeg >= 157.5 && azDeg < 202.5) view = "back view";
  else if (azDeg >= 202.5 && azDeg < 247.5) view = "back-left three-quarter view";
  else if (azDeg >= 247.5 && azDeg < 292.5) view = "left side profile";
  else if (azDeg >= 292.5 && azDeg < 337.5) view = "front-left three-quarter view";

  // 2. Calculate Angle (Vertical / Polar)
  // Polar 0 = Top, PI = Bottom, PI/2 = Equator
  const polDeg = (polar * 180) / Math.PI;
  
  let angle = "eye-level shot";
  
  if (polDeg < 30) angle = "overhead bird's-eye view";
  else if (polDeg >= 30 && polDeg < 75) angle = "high angle shot";
  else if (polDeg >= 75 && polDeg < 105) angle = "eye-level shot";
  else if (polDeg >= 105 && polDeg < 150) angle = "low angle shot";
  else if (polDeg >= 150) angle = "worm's-eye view";

  // 3. Calculate Framing (Distance)
  // Arbitrary units based on camera default position usually being around 5-10
  let framing = "medium shot";
  let technical = "50mm lens";

  if (distance < 2.5) {
    framing = "extreme close-up";
    technical = "macro lens, f/2.8";
  } else if (distance >= 2.5 && distance < 4) {
    framing = "close-up portrait";
    technical = "85mm lens, f/1.8, bokeh";
  } else if (distance >= 4 && distance < 7) {
    framing = "medium shot";
    technical = "50mm lens";
  } else if (distance >= 7 && distance < 12) {
    framing = "long shot";
    technical = "35mm lens";
  } else if (distance >= 12 && distance < 20) {
    framing = "wide angle shot";
    technical = "24mm lens, deep depth of field";
  } else {
    framing = "extreme long shot";
    technical = "16mm wide angle lens";
  }

  return { view, angle, framing, technical };
};

export const formatFullPrompt = (parts: PromptParts, subject: string = "character"): string => {
  return `${parts.framing}, ${parts.angle}, ${parts.view} of ${subject}, ${parts.technical}`;
};