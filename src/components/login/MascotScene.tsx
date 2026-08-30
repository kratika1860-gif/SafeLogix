import React from 'react';
import { motion } from 'motion/react';
import { InteractiveEye } from './InteractiveEye';

interface MascotSceneProps {
  isHovered?: boolean;
  showPassword?: boolean;
  loginSuccess?: boolean;
}

export function MascotScene({ isHovered = false, showPassword = false, loginSuccess = false }: MascotSceneProps) {
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden">
      <svg viewBox="0 0 800 600" className="w-full h-full relative z-10" preserveAspectRatio="xMidYMax meet">
        
        {/* TOP PINK HORIZONTAL MONSTER (Red Stalk) */}
        <motion.g
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <motion.g
            animate={
              loginSuccess 
                ? { y: [0, -25, 0], rotate: [0, 5, -5, 0] } 
                : { y: [0, -8, 0], rotate: [0, 1, -1, 0] }
            }
            transition={{ 
              duration: loginSuccess ? 0.6 : 5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {/* Neck extending from left */}
            <rect x="-50" y="160" width="200" height="40" fill="#F15E75" />
            {/* Head */}
            <rect x="100" y="140" width="180" height="80" rx="40" fill="#F15E75" />
            
            {/* Mouth */}
            {loginSuccess ? (
              <path d="M 140 180 Q 190 240 240 180" fill="#4B1020" />
            ) : isHovered ? (
              <circle cx="190" cy="190" r="15" fill="#4B1020" />
            ) : (
              <path d="M 140 180 Q 190 220 240 180" fill="#4B1020" />
            )}

            {/* Teeth */}
            {!isHovered && !loginSuccess && (
              <>
                <rect x="150" y="180" width="80" height="15" rx="4" fill="#FFF" />
                <rect x="188" y="180" width="4" height="15" fill="#4B1020" />
              </>
            )}

            {/* Eyes on stalks */}
            <rect x="160" y="110" width="16" height="40" fill="#F15E75" />
            <rect x="210" y="100" width="16" height="50" fill="#F15E75" />
            <InteractiveEye cx={168} cy={110} r={22} pupilR={8} delay={600} isClosed={showPassword} />
            <InteractiveEye cx={218} cy={100} r={22} pupilR={8} delay={700} isClosed={showPassword} />
          </motion.g>
        </motion.g>

        {/* LARGE PINK MONSTER (Right) */}
        <motion.g
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.g
            animate={
              loginSuccess 
                ? { y: [0, -40, 0], rotate: [0, -2, 2, 0] } 
                : { y: [0, -12, 0], rotate: [0, -0.5, 0.5, 0] }
            }
            transition={{ 
              duration: loginSuccess ? 0.7 : 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            {/* Body */}
            <path d="M 480 600 L 480 280 C 480 130, 720 130, 720 280 L 720 600 Z" fill="#FF8EAD" />
            
            {/* Open Mouth */}
            {loginSuccess ? (
              <path d="M 530 360 Q 600 500 670 360 Z" fill="#3D0014" />
            ) : isHovered ? (
              <ellipse cx="600" cy="410" rx="20" ry="35" fill="#3D0014" />
            ) : (
              <path d="M 530 380 Q 600 450 670 380 Z" fill="#3D0014" />
            )}

            {/* Teeth */}
            {!isHovered && !loginSuccess && (
              <path d="M 550 380 L 650 380 L 630 405 L 570 405 Z" fill="#FFF" />
            )}

            {/* Huge Eye */}
            <InteractiveEye cx={600} cy={240} r={48} pupilR={16} delay={200} isClosed={showPassword} />
          </motion.g>
        </motion.g>

        {/* BLUE MONSTER (Middle) */}
        <motion.g
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.g
            animate={
              loginSuccess 
                ? { y: [0, -35, 0], scaleY: [1, 1.05, 1] } 
                : { y: [0, -8, 0], scaleY: [1, 1.02, 1] }
            }
            transition={{ 
              duration: loginSuccess ? 0.5 : 4.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: loginSuccess ? 0 : 0.5
            }}
          >
            {/* Body */}
            <path d="M 330 600 L 330 480 C 330 390, 500 390, 500 480 L 500 600 Z" fill="#5692FF" />
            
            {/* Mouth */}
            {loginSuccess ? (
              <path d="M 395 500 Q 415 530 435 500 Z" fill="#1C3F7F" />
            ) : isHovered ? (
              <ellipse cx="415" cy="505" rx="10" ry="15" fill="#1C3F7F" />
            ) : (
              <>
                <rect x="395" y="500" width="40" height="20" rx="6" fill="#1C3F7F" />
                <rect x="400" y="500" width="14" height="12" rx="2" fill="#FFF" />
                <rect x="416" y="500" width="14" height="12" rx="2" fill="#FFF" />
              </>
            )}
            
            <InteractiveEye cx={390} cy={445} r={20} pupilR={8} delay={400} isClosed={showPassword} />
            <InteractiveEye cx={440} cy={445} r={20} pupilR={8} delay={450} isClosed={showPassword} />
          </motion.g>
        </motion.g>

        {/* TURQUOISE MONSTER (Left) */}
        <motion.g
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.g
            animate={
              loginSuccess 
                ? { y: [0, -40, 0] } 
                : { y: [0, -15, 0] }
            }
            transition={{ 
              duration: loginSuccess ? 0.6 : 5.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: loginSuccess ? 0 : 0.2
            }}
          >
            {/* Legs */}
            <rect x="210" y="440" width="16" height="160" fill="#6ED8D6" rx="8" />
            <rect x="270" y="440" width="16" height="160" fill="#6ED8D6" rx="8" />
            
            {/* Fluffy Body */}
            <g transform="translate(250, 360)">
              <circle cx="0" cy="0" r="75" fill="#6ED8D6" />
              <circle cx="-45" cy="-45" r="35" fill="#6ED8D6" />
              <circle cx="45" cy="-45" r="40" fill="#6ED8D6" />
              <circle cx="-60" cy="15" r="30" fill="#6ED8D6" />
              <circle cx="60" cy="20" r="35" fill="#6ED8D6" />
              <circle cx="-35" cy="65" r="35" fill="#6ED8D6" />
              <circle cx="35" cy="60" r="35" fill="#6ED8D6" />
              <circle cx="0" cy="-70" r="35" fill="#6ED8D6" />
            </g>
            
            {/* Eyes */}
            <InteractiveEye cx={215} cy={335} r={16} pupilR={6} delay={300} isClosed={showPassword} />
            <InteractiveEye cx={265} cy={310} r={22} pupilR={8} delay={330} isClosed={showPassword} />
            <InteractiveEye cx={290} cy={360} r={14} pupilR={5} delay={360} isClosed={showPassword} />
            
            {/* Mouth */}
            {loginSuccess ? (
              <path d="M 235 390 Q 250 420 265 390" fill="#1F2937" />
            ) : isHovered ? (
              <circle cx="250" cy="395" r="8" fill="#1F2937" />
            ) : (
              <path d="M 235 390 Q 250 405 265 390" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" fill="transparent" />
            )}
          </motion.g>
        </motion.g>

      </svg>
    </div>
  );
}
