import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import GPGPUParticles from './GPGPUParticles';
import CameraRig from './CameraRig';
import Starfield from './Starfield';

import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';

const Experience = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={['#00050a']} />
      
      <Stats />
      
      <CameraRig />
      <Starfield count={8000} />
      <GPGPUParticles />
      
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.05} 
            mipmapBlur 
            intensity={2.2} 
            radius={0.4}
        />
        <ChromaticAberration 
            offset={[0.002, 0.002]}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.03} />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;
