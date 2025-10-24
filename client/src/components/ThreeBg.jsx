import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';

function Shape({ color = '#7c3aed', position = [0,0,0], scale = 1, speed = 1 }) {
  return (
    <Float speed={0.5 * speed} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} transparent opacity={0.8} />
      </mesh>
    </Float>
  );
}

function GlassBlob({ position = [0,0,0], scale = 1, speed = 1, color = '#ffffff' }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.2 * speed;
    if (ref.current) {
      ref.current.rotation.x = Math.sin(t) * 0.4;
      ref.current.rotation.y = Math.cos(t * 1.2) * 0.3;
    }
  });
  return (
    <Float speed={0.4 * speed} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0}
          transmission={0.95}
          thickness={1.2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          ior={1.2}
        />
      </mesh>
    </Float>
  );
}

function SceneContent({ variant = 'form' }) {
  const group = useRef();

  const items = useMemo(() => {
    const base = variant === 'hero' ? 10 : variant === 'app' ? 8 : 6;
    const arr = [];
    for (let i = 0; i < base; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 6;
      const z = - (2 + Math.random() * 6);
      const scale = 0.4 + Math.random() * (variant === 'hero' ? 1.4 : 0.8);
      const color = i % 2 === 0 ? '#7c3aed' : '#22d3ee';
      const speed = 0.8 + Math.random() * 0.6;
      arr.push({ position: [x, y, z], scale, color, speed });
    }
    return arr;
  }, [variant]);

  const glass = useMemo(() => {
    const count = variant === 'hero' ? 4 : variant === 'app' ? 3 : 2;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 5;
      const z = - (3 + Math.random() * 6);
      const scale = 0.6 + Math.random() * (variant === 'hero' ? 1.2 : 0.8);
      const speed = 0.8 + Math.random() * 0.5;
      const color = i % 2 === 0 ? '#ffffff' : '#f6f5ff';
      arr.push({ position: [x, y, z], scale, speed, color });
    }
    return arr;
  }, [variant]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.05) * 0.1 + state.pointer.x * 0.15;
      group.current.rotation.x = Math.sin(t * 0.035) * 0.05 + state.pointer.y * 0.1;
    }
  });

  return (
    <group ref={group}>
      {items.map((p, i) => (
        <Shape key={`s-${i}`} {...p} />
      ))}
      {glass.map((g, i) => (
        <GlassBlob key={`g-${i}`} {...g} />
      ))}
    </group>
  );
}

export default function ThreeBg({ variant = 'form' }) {
  return (
    <div className="three-bg" aria-hidden>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 7], fov: 55 }}>
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 6, 14]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1.2} />
        <Environment preset="city" />
        <SceneContent variant={variant} />
      </Canvas>
    </div>
  );
}
