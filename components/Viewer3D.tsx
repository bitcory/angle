import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Billboard, Image as DreiImage, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CameraState, PromptParts } from '../types';
import { calculatePrompt } from '../utils/promptLogic';

// Cute humanoid placeholder figure
const HumanoidPlaceholder: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Bouncy idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const bodyColor = "#f5f5f5";
  const accentColor = "#e4e4e7";
  const cheekColor = "#fca5a5";

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Big Cute Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Left Eye */}
      <mesh position={[0.18, 1.25, 0.45]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      {/* Left Eye Shine */}
      <mesh position={[0.22, 1.3, 0.52]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Right Eye */}
      <mesh position={[-0.18, 1.25, 0.45]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#27272a" />
      </mesh>
      {/* Right Eye Shine */}
      <mesh position={[-0.14, 1.3, 0.52]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Left Cheek Blush */}
      <mesh position={[0.35, 1.1, 0.38]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={cheekColor} transparent opacity={0.6} />
      </mesh>

      {/* Right Cheek Blush */}
      <mesh position={[-0.35, 1.1, 0.38]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={cheekColor} transparent opacity={0.6} />
      </mesh>

      {/* Smile */}
      <mesh position={[0, 1.0, 0.5]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#52525b" />
      </mesh>

      {/* Chubby Body */}
      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.35, 0.4, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Left Arm - short and stubby */}
      <group position={[0.45, 0.45, 0]} rotation={[0, 0, -0.5]}>
        <mesh>
          <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0.08, -0.25, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Right Arm - short and stubby */}
      <group position={[-0.45, 0.45, 0]} rotation={[0, 0, 0.5]}>
        <mesh>
          <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.08, -0.25, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Left Leg - short and stubby */}
      <group position={[0.18, -0.15, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.13, 0.2, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.45, 0.05]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>

      {/* Right Leg - short and stubby */}
      <group position={[-0.18, -0.15, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.13, 0.2, 4, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Foot */}
        <mesh position={[0, -0.45, 0.05]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={accentColor} />
        </mesh>
      </group>
    </group>
  );
};

interface Viewer3DProps {
  imageSrc: string | null;
  onUpdate: (state: CameraState, prompt: PromptParts) => void;
  targetCamera: Partial<CameraState> | null;
}

const SceneContent: React.FC<Viewer3DProps> = ({ imageSrc, onUpdate, targetCamera }) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Handle external camera updates (from sidebar presets)
  useEffect(() => {
    if (targetCamera && controlsRef.current) {
      const controls = controlsRef.current;
      
      // We only update what is provided in targetCamera
      if (targetCamera.azimuth !== undefined) controls.setAzimuthalAngle(targetCamera.azimuth);
      if (targetCamera.polar !== undefined) controls.setPolarAngle(targetCamera.polar);
      if (targetCamera.distance !== undefined) {
         // Determine direction vector to maintain view direction while changing distance
         const dir = new THREE.Vector3().copy(camera.position).sub(controls.target).normalize();
         camera.position.copy(controls.target).add(dir.multiplyScalar(targetCamera.distance));
      }
      controls.update();
    }
  }, [targetCamera, camera]);

  // Track camera changes
  const handleChange = () => {
    if (controlsRef.current) {
      const az = controlsRef.current.getAzimuthalAngle();
      const pol = controlsRef.current.getPolarAngle();
      const dist = controlsRef.current.getDistance();

      const newState = { azimuth: az, polar: pol, distance: dist };
      const newPrompt = calculatePrompt(az, pol, dist);
      
      onUpdate(newState, newPrompt);
    }
  };

  return (
    <>
      <color attach="background" args={['#09090b']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="purple" />

      {/* Grid Floor */}
      <Grid 
        position={[0, -2, 0]} 
        args={[40, 40]} 
        cellSize={1} 
        sectionSize={5} 
        fadeDistance={30} 
        sectionColor="#52525b" 
        cellColor="#27272a" 
      />

      {/* Horizontal Equator Ring (Pink) */}
      {/* Rotation -90 on X makes it lie flat on XZ plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[4.95, 5.05, 128]} />
        <meshBasicMaterial color="#be185d" opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical Meridian Ring (Blue) */}
      {/* Rotation 90 on Y makes it vertical on YZ plane (Side Plane) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[4.95, 5.05, 128]} />
        <meshBasicMaterial color="#0e7490" opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* The Subject Reference */}
      {imageSrc ? (
        <Billboard follow={false} position={[0, 0, 0]}>
          <DreiImage 
            url={imageSrc} 
            transparent 
            scale={[3, 4]} // 3:4 Aspect ratio default
            side={THREE.DoubleSide} 
          />
        </Billboard>
      ) : (
        <HumanoidPlaceholder />
      )}

      <OrbitControls 
        ref={controlsRef}
        onChange={handleChange}
        enablePan={false}
        minDistance={2}
        maxDistance={20}
        dampingFactor={0.1}
      />
    </>
  );
};

export const Viewer3D: React.FC<Viewer3DProps> = (props) => {
  return (
    <div className="w-full h-full relative bg-zinc-950">
      <Canvas camera={{ position: [0, 1, 9], fov: 40 }}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};