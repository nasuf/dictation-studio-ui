import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { message } from "antd";
import { supabase } from "@/utils/supabaseClient";
import { EMAIL_VERIFIED_KEY } from "@/utils/const";
import { motion } from "framer-motion";

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
        textElement.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 200); // Adjust typing speed here

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white relative z-10">
      <span ref={textRef}></span>
      <span className="animate-blink-cursor">|</span>
    </h1>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailVerified = params.get("email_verified");
    if (emailVerified === "true") {
      localStorage.setItem(EMAIL_VERIFIED_KEY, "true");
      message.success(t("emailVerified"));
    } else if (params.get("email_confirm") === "true") {
      setShowEmailConfirm(true);
    }
  }, [location, t]);

  const HomeContent = () => (
    <>
      {showEmailConfirm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            to="/login"
            className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full 
                     transform transition duration-300 hover:scale-110 hover:bg-purple-500
                     animate-pulse relative z-10"
          >
            Click here to confirm your email
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl mb-12 max-w-2xl text-white/90 relative z-10"
          >
            {t("homePageDescription")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link
              to="/dictation/video"
              className="inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full 
                       transform transition duration-300 hover:scale-110 hover:bg-purple-500
                       animate-pulse relative z-10"
            >
              {t("startDictation")}
            </Link>
          </motion.div>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedSphere />
        </Canvas>
      </div>

      {/* Floating blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>

      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/30 z-0"></div>

      {/* Content with subtle backdrop blur */}
      <div className="relative z-10 text-center">
        {/* Subtle backdrop blur only behind text */}
        <div className="absolute inset-0 -m-10 backdrop-blur-sm bg-transparent rounded-full"></div>

        <TypewriterEffect text="Dictation Studio" />
        <HomeContent />
      </div>
    </div>
  );
};

export default HomePage;
