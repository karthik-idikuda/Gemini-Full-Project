import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';
import { useControls } from 'leva';
import * as THREE from 'three';
import HandManager from '../utils/HandManager';
import fragmentShaderVelocity from '../shaders/fragmentShaderVelocity.glsl?raw';
import fragmentShaderPosition from '../shaders/fragmentShaderPosition.glsl?raw';
import particlesVertex from '../shaders/particlesVertex.glsl?raw';
import particlesFragment from '../shaders/particlesFragment.glsl?raw';

const SIZE = 512; // Texture size (512x512 = 262,144 particles)

const getSphereData = () => {
  const data = new Float32Array(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    data[i * 4] = x;
    data[i * 4 + 1] = y;
    data[i * 4 + 2] = z;
    data[i * 4 + 3] = 1;
  }
  return data;
};

const getHeartData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI; // 0 to PI
        // Heart shape equation (approximate 3D volume or surface)
        // A common 3D heart formula: (x^2+9/4y^2+z^2-1)^3 - x^2z^3 - 9/80y^2z^3 = 0
        // Or simpler parametric:
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = variation
        
        // Let's use a distribution inside a heart volume
        // Rejection sampling or just mapping
        
        let x,y,z;
        // Simple 3D heart parametric approx
        const t = Math.random() * Math.PI * 2;
        const u = Math.random() * Math.PI; // partial sphere-like for volume?
        
        // Use standard parametric heart curve extended to 3D with rotation?
        // Let's use a known parametric surface
        // x = r * 16 * sin(t)^3
        // y = r * (13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
        // z = r * z_displacement
        
        // Let's do a noisy version
        const spread = 0.1;
        
        // Parametric Heart logic
        const t2 = Math.random() * Math.PI * 2;
        const x0 = 16 * Math.pow(Math.sin(t2), 3);
        const y0 = 13 * Math.cos(t2) - 5 * Math.cos(2 * t2) - 2 * Math.cos(3 * t2) - Math.cos(4 * t2);
        
        const scale = 0.2;
        x = x0 * scale;
        y = y0 * scale;
        z = (Math.random() - 0.5) * 2; // Extrude 
        
        // Better heart:
        // x = 16sin^3(u)sin(v)
        // y = (13cos(u) - 5cos(2u) - 2cos(3u) - cos(4u))
        // z = 16sin^3(u)cos(v)  <-- vaguely torus like but heart profile
        
        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = 1;
    }
    return data;
};

const getFlowerData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
         // Rose curve or similar
         const k = 4; // petals
         const theta = Math.random() * Math.PI * 2;
         const r = Math.cos(k * theta) * 3 + 1; // +1 to define thickness
         const phi = (Math.random() - 0.5) * Math.PI;
         
         const x = r * Math.cos(theta) * Math.cos(phi);
         const y = r * Math.sin(theta) * Math.cos(phi);
         const z = 3 * Math.sin(phi); // Thickness
         
         data[i * 4] = x;
         data[i * 4 + 1] = y;
         data[i * 4 + 2] = z;
         data[i * 4 + 3] = 1;
    }
    return data;
};

const getSaturnData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        // Planet + Rings
        // 70% Planet, 30% Rings
        if (i < SIZE * SIZE * 0.7) {
            // Sphere
            const r = 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            data[i * 4] = r * Math.sin(phi) * Math.cos(theta);
            data[i * 4 + 1] = r * Math.sin(phi) * Math.sin(theta);
            data[i * 4 + 2] = r * Math.cos(phi);
            data[i * 4 + 3] = 1;
        } else {
            // Rings
            const r = 2.5 + Math.random() * 2.0;
            const theta = Math.random() * Math.PI * 2;
            data[i * 4] = r * Math.cos(theta);
            data[i * 4 + 1] = (Math.random() - 0.5) * 0.1; // Flat y
            data[i * 4 + 2] = r * Math.sin(theta);
            data[i * 4 + 3] = 1;
        }
    }
    return data;
};

// 7. Galaxy (Spiral Arms)
const getGalaxyData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 8.0;
        const spiral = radius * 2.0;
        const armOffset = (i % 3) * (Math.PI * 2 / 3); // 3 arms
        
        const x = Math.cos(angle + spiral + armOffset) * radius;
        const z = Math.sin(angle + spiral + armOffset) * radius;
        const y = (Math.random() - 0.5) * (1.0 / (radius + 0.5)); // Bulge

        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = radius; // Size/Age factor
    }
    return data;
};

// 8. Black Hole (Event Horizon)
const getBlackHoleData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        const phi = Math.random() * Math.PI * 2;
        const costheta = Math.random() * 2 - 1;
        const theta = Math.acos(costheta);
        
        // Accretion disk vs Event horizon
        if (i % 2 === 0) {
            // Event Horizon Sphere
            const r = 1.0 + Math.random() * 0.2;
            data[i * 4] = r * Math.sin(theta) * Math.cos(phi);
            data[i * 4 + 1] = r * Math.sin(theta) * Math.sin(phi);
            data[i * 4 + 2] = r * Math.cos(theta);
        } else {
            // Accretion Disk
            const r = 2.0 + Math.random() * 6.0;
            const diskPhi = Math.random() * Math.PI * 2;
            data[i * 4] = r * Math.cos(diskPhi);
            data[i * 4 + 1] = (Math.random() - 0.5) * 0.1;
            data[i * 4 + 2] = r * Math.sin(diskPhi);
        }
        data[i * 4 + 3] = 1.0;
    }
    return data;
};

// 9. Tesseract (Hypercube 4D)
const getTesseractData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        // Random point on 4D hypercube edges/faces
        // For holographic effect, just fill the hypervolume shell
        const x = (Math.random() * 2 - 1) * 3;
        const y = (Math.random() * 2 - 1) * 3;
        const z = (Math.random() * 2 - 1) * 3;
        const w = (Math.random() * 2 - 1) * 3;

        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = w; // W coordinate stored in Alpha channel
    }
    return data;
};

const getSpiralData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        // Galaxy spiral
        const angle = Math.random() * Math.PI * 2 * 3; // 3 turns
        const radius = angle * 0.5 + Math.random();
        
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = (Math.random() - 0.5) * 0.5;
        
        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = 1;
    }
    return data;
};

const getHelixData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        const t = (i / (SIZE * SIZE)) * Math.PI * 20; // 10 turns
        const r = 2;
        const x = r * Math.cos(t);
        const y = ((i / (SIZE * SIZE)) - 0.5) * 10; // Height -5 to 5
        const z = r * Math.sin(t);
        
        // Double helix offset for half points? 
        // Or just one strand. Let's do double strand.
        // If i is odd, add PI to phase
        const phase = (i % 2 === 0) ? 0 : Math.PI;
        
        data[i * 4] = r * Math.cos(t + phase);
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = r * Math.sin(t + phase);
        data[i * 4 + 3] = 1;
    }
    return data;
};

const getWaveData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        // Grid plane
        const side = Math.sqrt(SIZE * SIZE); // 256
        const ix = i % side;
        const iy = Math.floor(i / side);
        
        const x = (ix / side - 0.5) * 10;
        const z = (iy / side - 0.5) * 10;
        const y = 0; // Flat initially, animated in shader
        
        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = 1;
    }
    return data;
};

const getNebulaData = () => {
    const data = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < SIZE * SIZE; i++) {
        // Cloud-like clusters
        // Random centers
        const centers = [
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(-2, 1, -1),
            new THREE.Vector3(0, -2, 2),
            new THREE.Vector3(0, 0, 0)
        ];
        
        const center = centers[Math.floor(Math.random() * centers.length)];
        
        // Gaussian spread around center
        const r = Math.random() * 2.5; // Radius of cluster
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = center.x + r * Math.sin(phi) * Math.cos(theta);
        const y = center.y + r * Math.sin(phi) * Math.sin(theta);
        const z = center.z + r * Math.cos(phi);
        
        data[i * 4] = x;
        data[i * 4 + 1] = y;
        data[i * 4 + 2] = z;
        data[i * 4 + 3] = 1;
    }
    return data;
};



const GPGPUParticles = () => {
  const { gl } = useThree();
  const gpuCompute = useRef();
  const velocityVariable = useRef();
  const positionVariable = useRef();
  const pointsRef = useRef();

  const { shape } = useControls({
    shape: { options: ['Sphere', 'Heart', 'Flower', 'Saturn', 'Helix', 'Wave', 'Spiral', 'Galaxy', 'BlackHole', 'Tesseract'] }
  });

  // Unique data textures for each shape
  const shapeTextures = useMemo(() => {
    return {
        Sphere: new THREE.DataTexture(getSphereData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Heart: new THREE.DataTexture(getHeartData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Flower: new THREE.DataTexture(getFlowerData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Saturn: new THREE.DataTexture(getSaturnData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Helix: new THREE.DataTexture(getHelixData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Wave: new THREE.DataTexture(getWaveData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Spiral: new THREE.DataTexture(getSpiralData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Galaxy: new THREE.DataTexture(getGalaxyData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        BlackHole: new THREE.DataTexture(getBlackHoleData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
        Tesseract: new THREE.DataTexture(getTesseractData(), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType),
    };
  }, []);

  Object.values(shapeTextures).forEach(t => t.needsUpdate = true);

  // Uniforms for the render material
  const uniforms = useMemo(() => ({
    uPositions: { value: null },
    uVelocities: { value: null },
    uSize: { value: 6.0 },
    uColor: { value: new THREE.Vector3(1, 0.2, 0.5) },
    uTime: { value: 0 }
  }), []);

  // Interaction Logic
  useEffect(() => {
      const colors = {
          Sphere: new THREE.Vector3(0.2, 0.5, 1.0), 
          Heart: new THREE.Vector3(1.0, 0.1, 0.2), 
          Flower: new THREE.Vector3(1.0, 0.6, 0.0), 
          Saturn: new THREE.Vector3(1.0, 0.9, 0.5), 
          Helix: new THREE.Vector3(0.1, 1.0, 0.5), 
          Wave: new THREE.Vector3(0.0, 0.8, 1.0), 
          Spiral: new THREE.Vector3(0.8, 0.2, 1.0), 
          Galaxy: new THREE.Vector3(1.0, 0.2, 0.8), 
          BlackHole: new THREE.Vector3(1.0, 0.4, 0.1), 
          Tesseract: new THREE.Vector3(0.0, 1.0, 0.8), // Cyan/Teal
      };
      
      const shapeIds = {
          Sphere: 0,
          Heart: 1,
          Flower: 2,
          Saturn: 3,
          Helix: 4,
          Wave: 5,
          Spiral: 6,
          Galaxy: 7,
          BlackHole: 8,
          Tesseract: 9,
      };

      if (velocityVariable.current && shapeTextures[shape]) {
          velocityVariable.current.material.uniforms.uTargetPositions.value = shapeTextures[shape];
          velocityVariable.current.material.uniforms.uTargetShape.value = shapeIds[shape] || 0;
          if (colors[shape]) {
              uniforms.uColor.value.copy(colors[shape]);
          }
      }
  }, [shape, shapeTextures, uniforms]);

  // Initialize GPGPU
  useEffect(() => {
    gpuCompute.current = new GPUComputationRenderer(SIZE, SIZE, gl);

    const dtPosition = gpuCompute.current.createTexture();
    const dtVelocity = gpuCompute.current.createTexture();
    
    fillPositions(dtPosition); 
    fillVelocities(dtVelocity);

    velocityVariable.current = gpuCompute.current.addVariable('textureVelocity', fragmentShaderVelocity, dtVelocity);
    positionVariable.current = gpuCompute.current.addVariable('texturePosition', fragmentShaderPosition, dtPosition);

    gpuCompute.current.setVariableDependencies(velocityVariable.current, [positionVariable.current, velocityVariable.current]);
    gpuCompute.current.setVariableDependencies(positionVariable.current, [positionVariable.current, velocityVariable.current]);

    const velUniforms = velocityVariable.current.material.uniforms;
    velUniforms.uTime = { value: 0 };
    velUniforms.uDelta = { value: 0 };
    velUniforms.uTargetPositions = { value: shapeTextures['Sphere'] }; 
    velUniforms.uTargetShape = { value: 0 };
    velUniforms.uMouse = { value: new THREE.Vector3(0, 0, 0) };
    velUniforms.uInteractionRadius = { value: 2.0 };
    velUniforms.uInteractionStrength = { value: 5.0 };

    const posUniforms = positionVariable.current.material.uniforms;
    posUniforms.uDelta = { value: 0 };

    const error = gpuCompute.current.init();
    if (error !== null) {
      console.error(error);
    }
    
    HandManager.init();
  }, [gl, shapeTextures]); 

  // Time Scale for Warp
  const timeScaleRef = useRef(1.0);

  useFrame((state, delta) => {
    if (!gpuCompute.current) return;

    const handData = HandManager.getHandData();
    const { pointer } = state;
    
    // --- 1. Interaction Mapping ---
    const vFov = (state.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * state.camera.position.z;
    const width = height * state.camera.aspect;

    const velUniforms = velocityVariable.current.material.uniforms;

    if (handData) {
        // Precise hand tracking parallax
        const x = (handData.x - 0.5) * width; 
        const y = -(handData.y - 0.5) * height; // Invert for 3D space
        velUniforms.uMouse.value.lerp(new THREE.Vector3(x, y, 0), 5 * delta);
        
        // Dynamic interaction based on pinch
        velUniforms.uInteractionRadius.value = THREE.MathUtils.lerp(
            velUniforms.uInteractionRadius.value,
            handData.isPinching ? 4.0 : 2.0,
            5 * delta
        );
        velUniforms.uInteractionStrength.value = handData.isPinching ? 5.0 : -35.0;
    } else {
        // Mouse fallback
        const x = (pointer.x * width) / 2;
        const y = (pointer.y * height) / 2;
        velUniforms.uMouse.value.lerp(new THREE.Vector3(x, y, 0), 5 * delta);
    }

    // --- 2. Dynamic Time Warp ---
    let targetTimeScale = 1.0;
    if (handData) {
        targetTimeScale = handData.isPinching ? 0.2 : 0.6;
    }
    timeScaleRef.current = THREE.MathUtils.lerp(timeScaleRef.current, targetTimeScale, 2 * delta);
    
    const scaledDelta = delta * timeScaleRef.current;
    const time = state.clock.getElapsedTime();

    // Update Simulation Uniforms
    velUniforms.uTime.value = time;
    velUniforms.uDelta.value = scaledDelta;

    const posUniforms = positionVariable.current.material.uniforms;
    posUniforms.uDelta.value = scaledDelta;

    // Compute
    gpuCompute.current.compute();

    // Update Render Uniforms
    uniforms.uPositions.value = gpuCompute.current.getCurrentRenderTarget(positionVariable.current).texture;
    uniforms.uVelocities.value = gpuCompute.current.getCurrentRenderTarget(velocityVariable.current).texture;
    uniforms.uTime.value = time;
  });

  // Helpers to fill textures
  const fillPositions = (texture) => {
    const arr = texture.image.data;
    for (let i = 0; i < arr.length; i += 4) {
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        arr[i] = x;
        arr[i + 1] = y;
        arr[i + 2] = z;
        arr[i + 3] = 1;
    }
  };

  const fillVelocities = (texture) => {
    const arr = texture.image.data;
    for (let i = 0; i < arr.length; i += 4) {
        arr[i] = 0;
        arr[i + 1] = 0;
        arr[i + 2] = 0;
        arr[i + 3] = 1;
    }
  };

  // Generate Reference Positions (UVs)
  const particlesReference = useMemo(() => {
    const arr = new Float32Array(SIZE * SIZE * 3);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const k = i * SIZE + j;
            arr[k * 3] = j / (SIZE - 1); // x -> u
            arr[k * 3 + 1] = i / (SIZE - 1); // y -> v
            arr[k * 3 + 2] = 0;
        }
    }
    return arr;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesReference.length / 3}
          array={particlesReference}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particlesVertex}
        fragmentShader={particlesFragment}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default GPGPUParticles;
