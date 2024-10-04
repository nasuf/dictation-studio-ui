import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";

const AnimatedSphere = () => {
  return (
    <Sphere args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#8B5CF6"
        attach="material"
        distort={0.5}
        speed={2}
      />
    </Sphere>
  );
};

const TypewriterEffect: React.FC<{ text: string }> = ({ text }) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    let i = 0;
    textElement.textContent = "";

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        console.log(text.charAt(i));
        textElement.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 200); // Adjust typing speed here

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <h1 className="text-6xl font-bold mb-6 text-white">
      <span ref={textRef}></span>
      <span className="animate-blink-cursor">|</span>
    </h1>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
        </Canvas>
      </div>
      <div className="z-10 text-center">
        <TypewriterEffect text="Dictation Studio" />
        <p className="text-xl mb-12 animate-fade-in-up max-w-2xl">
          {t("homePageDescription")}
        </p>
        <Link
          to="/dictation/video"
          className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full 
                     transform transition duration-300 hover:scale-110 hover:bg-purple-500
                     animate-pulse"
        >
          {t("startDictation")}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
