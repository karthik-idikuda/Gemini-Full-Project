import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HandManager from '../utils/HandManager';

const CameraRig = () => {
    const { camera } = useThree();
    const vec = new THREE.Vector3();
    
    useFrame((state, delta) => {
        const handData = HandManager.getHandData();
        const t = state.clock.getElapsedTime();
        
        // --- 1. Ultra-Smooth Zoom ---
        let targetZ = 10; // Default view
        
        if (handData) {
            if (handData.isPinching) {
                // Map pinch to zoom (3.5 to 9.5)
                const pinch = Math.min(Math.max(handData.pinchDist, 0), 0.08);
                const zoomFactor = pinch * 12.5; 
                targetZ = 3.5 + zoomFactor * 6; 
            } else {
                targetZ = 8.5;
            }
        }
        
        // Use a slower, more cinematic lerp for zoom
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 1.5 * delta);

        // --- 2. 4D Parallax Tilt ---
        let targetX = 0;
        let targetY = 0;

        if (handData) {
            // Precise hand tracking parallax
            targetX = (handData.x - 0.5) * 6;
            targetY = (handData.y - 0.5) * -6; // Inverted Y for natural tilt
        } else {
            // Slow orbital drift when idle
            targetX = Math.sin(t * 0.3) * 1.5;
            targetY = Math.cos(t * 0.2) * 1.0;
        }

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 1.2 * delta);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 1.2 * delta);
        
        // Look at a dynamic target for deep parallax
        vec.set(targetX * 0.1, targetY * 0.1, 0);
        camera.lookAt(vec);
        
        // Subtle tilt/roll for "flying" feel
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, (targetX * 0.02), 0.5 * delta);
    });

    return null;
};

export default CameraRig;
