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

// Advanced typewriter effect with gradient text
const TypewriterEffect: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div className="relative">
      <h1 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
        {displayText}
        <span className="animate-pulse text-purple-400">|</span>
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

      {/* Floating microphone icons */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-indigo-400/20 text-6xl"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animation: `float-icon ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          >
            🎤
          </div>
        ))}
      </div>

      {/* Digital rain effect */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-cyan-400 text-sm font-mono"
            style={{
              left: `${i * 5}%`,
              animation: `digital-rain ${3 + Math.random() * 4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            01010101
          </div>
        ))}
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
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
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
        className="absolute pointer-events-none z-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl transition-all duration-300"
        style={{
          left: `${(mousePosition.x + 1) * 50}%`,
          top: `${(-mousePosition.y + 1) * 50}%`,
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

      {/* Custom CSS animations */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes circuit-pulse {
          0%, 100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }
        
        @keyframes circuit-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(30px, 30px);
          }
        }
        
        @keyframes waveform {
          0% {
            height: 20%;
            opacity: 0.6;
          }
          100% {
            height: 80%;
            opacity: 1;
          }
        }
        
        @keyframes float-icon {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }
        
        @keyframes digital-rain {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        /* Glowing border effect */
        .glow-border {
          position: relative;
        }
        
        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          padding: 2px;
          background: linear-gradient(45deg, #8B5CF6, #3B82F6, #06B6D4, #8B5CF6);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          animation: border-rotate 3s linear infinite;
        }
        
        @keyframes border-rotate {
          0% {
            background: linear-gradient(45deg, #8B5CF6, #3B82F6, #06B6D4, #8B5CF6);
          }
          25% {
            background: linear-gradient(45deg, #3B82F6, #06B6D4, #8B5CF6, #3B82F6);
          }
          50% {
            background: linear-gradient(45deg, #06B6D4, #8B5CF6, #3B82F6, #06B6D4);
          }
          75% {
            background: linear-gradient(45deg, #8B5CF6, #3B82F6, #06B6D4, #8B5CF6);
          }
          100% {
            background: linear-gradient(45deg, #3B82F6, #06B6D4, #8B5CF6, #3B82F6);
          }
        }

        /* Holographic text effect */
        .holographic-text {
          background: linear-gradient(
            45deg,
            #ff006e,
            #fb5607,
            #ffbe0b,
            #8338ec,
            #3a86ff
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: holographic 3s ease-in-out infinite;
        }
        
        @keyframes holographic {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Particle trail effect */
        .particle-trail {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: particle-float 2s ease-out forwards;
        }
        
        @keyframes particle-float {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-100px);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;