import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { message } from "antd";
import { supabase } from "@/utils/supabaseClient";
import { EMAIL_VERIFIED_KEY } from "@/utils/const";
import * as THREE from "three";

// Advanced animated sphere with floating effect
const AnimatedSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#8B5CF6"
          attach="material"
          distort={0.8}
          speed={3}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

// Floating particles background
const FloatingParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#60A5FA" size={0.05} sizeAttenuation />
    </points>
  );
};

// Advanced typewriter effect with gradient text and blinking cursor
const TypewriterEffect: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    } else if (!isTypingComplete) {
      // Typing completed, start cursor blinking
      setIsTypingComplete(true);
    }
  }, [currentIndex, text, isTypingComplete]);

  // Cursor blinking effect after typing is complete
  useEffect(() => {
    if (isTypingComplete) {
      const blinkInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 600); // Blink every 600ms
      return () => clearInterval(blinkInterval);
    }
  }, [isTypingComplete]);

  return (
    <div className="relative">
      <h1 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
        {displayText}
        <span 
          className={`text-purple-400 ${
            isTypingComplete 
              ? (showCursor ? 'opacity-100' : 'opacity-0') 
              : 'animate-pulse'
          } transition-opacity duration-150`}
        >
          |
        </span>
      </h1>
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-xl opacity-70 animate-pulse"></div>
    </div>
  );
};

// Advanced sci-fi background with audio waveforms
const SciFiAudioBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient with deeper tech colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"></div>
      
      {/* Animated circuit board pattern */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.4) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(45deg, transparent 48%, rgba(59, 130, 246, 0.2) 49%, rgba(59, 130, 246, 0.2) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(139, 92, 246, 0.15) 49%, rgba(139, 92, 246, 0.15) 51%, transparent 52%)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px, 40px 40px',
          animation: 'circuit-pulse 15s ease-in-out infinite, circuit-move 25s linear infinite'
        }}
      ></div>

      {/* Audio waveform visualization */}
      <div className="absolute inset-0 opacity-25">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-gradient-to-t from-transparent via-cyan-400/30 to-transparent"
            style={{
              left: `${(i * 8) + 10}%`,
              width: '2px',
              height: `${30 + Math.sin(i) * 20}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              animation: `waveform ${1 + i * 0.1}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>


      {/* Multilingual word rain effect */}
      <div className="absolute inset-0 opacity-15">
        {[...Array(20)].map((_, i) => {
          const words = {
            english: ['voice', 'speech', 'audio', 'sound', 'listen', 'speak', 'word', 'text'],
            chinese: ['语音', '听写', '声音', '文字', '说话', '录音', '转换', '识别'],
            japanese: ['音声', '聴写', '録音', '文字', '話す', '聞く', '変換', '認識'],
            korean: ['음성', '듣기', '녹음', '문자', '말하기', '소리', '변환', '인식']
          };
          
          const languages = Object.keys(words);
          const randomLang = languages[Math.floor(Math.random() * languages.length)];
          const randomWord = words[randomLang as keyof typeof words][Math.floor(Math.random() * words[randomLang as keyof typeof words].length)];
          
          return (
            <div
              key={i}
              className="absolute text-cyan-400/60 text-sm font-medium"
              style={{
                left: `${i * 5}%`,
                animation: `word-rain ${3 + Math.random() * 4}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                fontFamily: randomLang === 'chinese' || randomLang === 'japanese' ? 'system-ui' : 'Inter, system-ui'
              }}
            >
              {randomWord}
            </div>
          );
        })}
      </div>
    </div>
  );
};


const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSignUpPendingConfirmation, setIsSignUpPendingConfirmation] = useState(false);
  const [confirmationUrl, setConfirmationUrl] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const confirmationUrl = queryParams.get("confirmation_url");

    if (location.pathname.includes("/signup-confirmation") && confirmationUrl) {
      setIsSignUpPendingConfirmation(true);
      setConfirmationUrl(confirmationUrl);
    }
    if (location.pathname.includes("/signup-success")) {
      setIsSignUpPendingConfirmation(false);
      message.success(t("signupSuccess"));
    }
  }, [location, t]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const ActionButton: React.FC<{ 
    to?: string; 
    onClick?: () => void; 
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
  }> = ({ to, onClick, children, variant = 'primary' }) => {
    const baseClasses = `
      relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full
      transform transition-all duration-300 hover:scale-110 group overflow-hidden
      ${variant === 'primary' 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-purple-500/50' 
        : 'bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20'
      }
    `;

    const content = (
      <>
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </>
    );

    if (to) {
      return (
        <Link to={to} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className={baseClasses}>
        {content}
      </button>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sci-Fi Audio Background */}
      <SciFiAudioBackground />
      
      {/* Interactive cursor glow */}
      <div 
        className="absolute pointer-events-none z-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      ></div>

      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60A5FA" />
          <AnimatedSphere />
          <FloatingParticles />
        </Canvas>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-16">
          <TypewriterEffect text="Dictation Studio" />
          
          {isSignUpPendingConfirmation ? (
            <div className="space-y-6">
              <p className="text-2xl mb-8 text-purple-200 animate-fade-in-up max-w-2xl">
                Please confirm your email to complete registration
              </p>
              <ActionButton 
                onClick={() => {
                  localStorage.setItem(EMAIL_VERIFIED_KEY, "true");
                  supabase.auth.refreshSession();
                  window.open(confirmationUrl, '_blank');
                }}
                variant="primary"
              >
                Confirm Email
              </ActionButton>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-2xl mb-12 text-purple-200 animate-fade-in-up max-w-3xl leading-relaxed">
                {t("homePageDescription")}
              </p>
              <div className="flex justify-center">
                <ActionButton to="/dictation/video" variant="primary">
                  {t("startDictation")}
                </ActionButton>
              </div>
            </div>
          )}
        </div>


      </div>

    </div>
  );
};

export default HomePage;