import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere args={[1, 100, 200]} ref={meshRef}>
      <MeshDistortMaterial
        color="#8B5CF6"
        attach="material"
        distort={0.5}
        speed={2}
      />
    </Sphere>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
        </Canvas>
      </div>
      <div className="z-10 text-center">
        <h1 className="text-6xl font-bold mb-6 animate-fade-in-down">
          Daily Dictation
        </h1>
        <p className="text-xl mb-12 animate-fade-in-up max-w-2xl">
          {t("homePageDescription")}
        </p>
        <Link
          to="/dictation/video"
          className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full 
                     transform transition duration-3000 hover:scale-110 hover:bg-purple-500
                     animate-pulse"
        >
          {t("startDictation")}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
