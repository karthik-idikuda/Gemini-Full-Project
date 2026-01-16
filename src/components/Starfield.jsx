import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Starfield = ({ count = 5000 }) => {
    const pointsRef = useRef();

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Distribute in a large sphere
            const r = 20 + Math.random() * 80;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            sizes[i] = Math.random() * 2.5;
            
            // Randomly blue-ish or white-ish stars
            const isBlue = Math.random() > 0.8;
            colors[i * 3] = isBlue ? 0.7 : 0.9;
            colors[i * 3 + 1] = isBlue ? 0.8 : 0.9;
            colors[i * 3 + 2] = 1.0;
        }

        return { positions, sizes, colors };
    }, [count]);

    useFrame((state) => {
        if (!pointsRef.current) return;
        
        // Slow rotation for background drift
        const t = state.clock.getElapsedTime() * 0.02;
        pointsRef.current.rotation.y = t;
        pointsRef.current.rotation.x = t * 0.5;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                sizeAttenuation={true}
                vertexColors={true}
                transparent={true}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
};

export default Starfield;
