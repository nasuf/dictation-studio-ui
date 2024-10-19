"use client";

import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/utils/util";

interface GradualSpacingProps {
  text: string;
  className?: string;
  customProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const GradualSpacing: React.FC<GradualSpacingProps> = ({
  text,
  className,
  customProps,
}) => {
  return (
    <div className="flex justify-center space-x-1" {...customProps}>
      <AnimatePresence>
        {text.split("").map((char, i) => (
          <motion.h1
            key={i}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className={cn("drop-shadow-sm ", className)}
          >
            {char === " " ? <span>&nbsp;</span> : char}
          </motion.h1>
        ))}
      </AnimatePresence>
    </div>
  );
};
