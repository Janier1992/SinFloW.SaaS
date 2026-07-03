"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Brain, Code } from "lucide-react";

export function HummingbirdNeuralNetwork() {
  const [scrollY, setScrollY] = useState(0);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollYRef = useRef(0);

  // Track scroll position and mobile screen size
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      scrollYRef.current = currentScroll;
    };
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleScroll();
    checkMobile();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Continuous rotation of the orbit, speeded up slightly by scrolling
  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;
    const animate = () => {
      const scrollSpeedMultiplier = 1 + Math.min(scrollYRef.current * 0.003, 3);
      angle += 0.35 * scrollSpeedMultiplier;
      setOrbitAngle(angle % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Coordinates matching a responsive viewBox of "0 0 1400 800"
  const colibriX = 80;
  const colibriY = 120;
  const colibriSize = 450;
  
  // Origin of the neural lines from the hummingbird's tail
  const tailX = colibriX + 130;
  const tailY = colibriY + 340;

  // Orbit Center on the right side
  const orbitCenterX = 1080;
  const orbitCenterY = 380;
  const orbitRadius = 160;

  // Paths from Hummingbird tail to the Orbit on the right
  // We deform them slightly dynamically based on scrollY
  const getPath1 = () => {
    const offset = Math.sin(scrollY * 0.003) * 25;
    return `M ${tailX},${tailY} 
            C ${tailX + 250},${tailY + 150 + offset} 
              ${orbitCenterX - 450},${orbitCenterY - 200 - offset} 
              ${orbitCenterX - 160},${orbitCenterY}`;
  };

  const getPath2 = () => {
    const offset = Math.cos(scrollY * 0.004) * 20;
    return `M ${tailX},${tailY} 
            C ${tailX + 300},${tailY - 100 - offset} 
              ${orbitCenterX - 400},${orbitCenterY + 250 + offset} 
              ${orbitCenterX - 113},${orbitCenterY + 113}`;
  };

  const getPath3 = () => {
    const offset = Math.sin(scrollY * 0.002) * 30;
    return `M ${tailX},${tailY} 
            C ${tailX + 450},${tailY + 50 + offset} 
              ${orbitCenterX - 350},${orbitCenterY - 100 - offset} 
              ${orbitCenterX - 113},${orbitCenterY - 113}`;
  };

  // Helper to calculate coordinates of orbiting icons in the SVG space
  const getIconCoords = (index: number) => {
    const angleRad = ((orbitAngle + index * 90) * Math.PI) / 180;
    return {
      x: orbitCenterX + orbitRadius * Math.cos(angleRad) - 24, // 24 is half of icon size (48px)
      y: orbitCenterY + orbitRadius * Math.sin(angleRad) - 24,
    };
  };

  const icons = [
    { Icon: TrendingUp, label: "Analítica", color: "from-blue-400 to-cyan-500" },
    { Icon: Zap, label: "RPA / Automación", color: "from-amber-400 to-orange-500" },
    { Icon: Brain, label: "Modelos IA", color: "from-purple-400 to-pink-500" },
    { Icon: Code, label: "Desarrollo", color: "from-emerald-400 to-teal-500" },
  ];

  return (
    <div className="absolute inset-0 w-full h-[600px] lg:h-[900px] pointer-events-none z-0 block overflow-hidden">
      <svg 
        viewBox="0 0 1400 800" 
        width="100%" 
        height="100%" 
        preserveAspectRatio={isMobile ? "xMidYMid meet" : "xMidYMid slice"}
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="neural-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#7B5CFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7B5CFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="neural-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0A0F1C" stopOpacity="0" />
          </linearGradient>
          
          {/* Neon Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- LARGE BACKGROUND HUMMINGBIRD (Transparent via Invert + Hue-Rotate) --- */}
        <image
          href="/sinflow-logo.jpg"
          x={colibriX}
          y={colibriY}
          width={colibriSize}
          height={colibriSize}
          style={{
            filter: "invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)",
            opacity: 0.16
          }}
        />

        {/* --- ORBIT PATH (Glow effect behind) --- */}
        <circle
          cx={orbitCenterX}
          cy={orbitCenterY}
          r={orbitRadius}
          fill="none"
          stroke="rgba(0, 224, 255, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />

        {/* --- NEURAL PATHS (The Extended Tail) --- */}
        <path
          d={getPath1()}
          fill="none"
          stroke="url(#neural-gradient-1)"
          strokeWidth="2.5"
        />
        <path
          d={getPath2()}
          fill="none"
          stroke="url(#neural-gradient-2)"
          strokeWidth="2"
        />
        <path
          d={getPath3()}
          fill="none"
          stroke="url(#neural-gradient-1)"
          strokeWidth="1.5"
        />

        {/* --- NEURAL INTERSECTING NODES --- */}
        {/* Branch 1 Nodes */}
        <circle cx={tailX + 350} cy={tailY + 110} r="4" fill="#7B5CFF" filter="url(#glow)" className="animate-pulse" />
        <circle cx={orbitCenterX - 450} cy={orbitCenterY - 80} r="5" fill="#00E0FF" filter="url(#glow)" />
        <circle cx={orbitCenterX - 160} cy={orbitCenterY} r="3" fill="#7B5CFF" />

        {/* Branch 2 Nodes */}
        <circle cx={tailX + 280} cy={tailY - 60} r="4" fill="#22C55E" filter="url(#glow)" />
        <circle cx={orbitCenterX - 400} cy={orbitCenterY + 120} r="3" fill="#00E0FF" />
        <circle cx={orbitCenterX - 113} cy={orbitCenterY + 113} r="4.5" fill="#22C55E" filter="url(#glow)" />

        {/* Branch 3 Nodes */}
        <circle cx={tailX + 410} cy={tailY - 10} r="3.5" fill="#7B5CFF" />
        <circle cx={orbitCenterX - 350} cy={orbitCenterY - 40} r="4" fill="#00E0FF" filter="url(#glow)" className="animate-pulse" />
        <circle cx={orbitCenterX - 113} cy={orbitCenterY - 113} r="3" fill="#7B5CFF" />

        {/* --- NEURAL PARTICLES FLOWING ALONG THE PATHS --- */}
        {/* Particle 1 */}
        <motion.circle
          r="4.5"
          fill="#00E0FF"
          filter="url(#glow)"
          style={{
            offsetPath: `path('${getPath1()}')`,
            offsetRotate: "auto",
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Particle 2 */}
        <motion.circle
          r="3.5"
          fill="#22C55E"
          filter="url(#glow)"
          style={{
            offsetPath: `path('${getPath2()}')`,
            offsetRotate: "auto",
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: "linear",
            delay: 1.2,
          }}
        />

        {/* Particle 3 */}
        <motion.circle
          r="3"
          fill="#7B5CFF"
          filter="url(#glow)"
          style={{
            offsetPath: `path('${getPath3()}')`,
            offsetRotate: "auto",
          }}
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
            delay: 2.5,
          }}
        />

        {/* --- ORBIT CENTER "IA" --- */}
        <g filter="url(#glow)">
          {/* Glowing central circle */}
          <circle
            cx={orbitCenterX}
            cy={orbitCenterY}
            r="48"
            fill="#0A0F1C"
            stroke="#00E0FF"
            strokeWidth="1.5"
            style={{
              boxShadow: "0 0 20px rgba(0, 224, 255, 0.5)",
            }}
          />
          {/* Glowing text inside central circle */}
          <text
            x={orbitCenterX}
            y={orbitCenterY + 11}
            textAnchor="middle"
            fill="url(#neural-gradient-1)"
            fontSize="32"
            fontWeight="900"
            letterSpacing="3"
            style={{
              fontFamily: "var(--font-geist-sans), sans-serif",
            }}
          >
            IA
          </text>
        </g>

        {/* --- ORBITING SERVICES ICONS (HTML Rendered inside SVG viewBox) --- */}
        {icons.map((item, index) => {
          const coords = getIconCoords(index);
          const { Icon, label, color } = item;
          return (
            <foreignObject
              key={index}
              x={coords.x}
              y={coords.y}
              width="48"
              height="48"
              className="pointer-events-auto"
            >
              <div className="w-12 h-12 rounded-full bg-gray-950 border border-sinflow-border/80 flex items-center justify-center shadow-lg shadow-black/80 hover:border-sinflow-secondary transition-all duration-300 relative group cursor-pointer">
                {/* Glowing orbit icon background */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                
                {/* Counter-rotating wrapper to keep the icon vertical */}
                <motion.div
                  style={{ rotate: -orbitAngle }}
                  className="flex items-center justify-center text-sinflow-text-light group-hover:text-sinflow-secondary transition-colors duration-300"
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>

                {/* Micro-tooltip for orbit icon */}
                <div 
                  className="absolute opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 pointer-events-none -bottom-8 px-2 py-0.5 rounded bg-gray-950 border border-sinflow-border/50 text-[10px] text-sinflow-secondary font-semibold whitespace-nowrap shadow-md transition-all duration-200"
                  style={{ transform: `rotate(${-orbitAngle}deg)` }}
                >
                  {label}
                </div>
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}
