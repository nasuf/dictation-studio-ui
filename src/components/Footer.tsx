import React from "react";

const AppFooter: React.FC = () => {
  return (
    <footer className="hidden md:block modern-footer py-4 text-center">
      {/* Background Pattern */}
      <div className="footer-pattern"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="footer-floating-element"
            style={{
              width: `${6 + i * 2}px`,
              height: `${6 + i * 2}px`,
              left: `${15 + i * 30}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i * 0.3}s`,
            }}
          />
        ))}
      </div>
      
      <div className="modern-footer-text relative z-10">
        Dictation Studio since 2024 - Created by NASUF
      </div>
    </footer>
  );
};

export default AppFooter;
