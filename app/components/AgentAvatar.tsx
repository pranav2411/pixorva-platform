'use client';

import React from 'react';

interface AgentAvatarProps {
  id: string;
  className?: string;
}

export default function AgentAvatar({ id, className = "w-14 h-14" }: AgentAvatarProps) {
  // Simple deterministic string hashing for procedural fallback styling
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hashVal = getHash(id || 'custom');

  // Map agent IDs to specific styles and SVG configurations
  const getAvatarConfig = () => {
    switch (id) {
      case 'dev-1': // Devon (React Developer)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Devon.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'dev-2': // Ruby (Database Architect)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Ruby.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'mkt-2': // Stella (Social Media Mgr)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Stella.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'mkt-3': // Gordon (SEO Blog Writer)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Gordon.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'dev-3': // Quinn (Testing Engineer)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Quinn.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'dev-4': // Cy (Security Compliance)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Cy.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'mkt-1': // Marcus (Twitter Campaigner)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Marcus.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'mkt-4': // Vic (Video Editor Script)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Vic.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'sales-1': // Sarah (Cold SDR Outreach)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Sarah.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'sales-2': // Larry (Leads B2B Miner)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Larry.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'ops-1': // Holly (HR Specialist)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Holly.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'ops-2': // Finn (EBITDA Optimizer)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Finn.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'ops-3': // Lawson (Legal Boilerplates)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Lawson.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'ops-4': // Pat (Agile PM Planner)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Pat.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      case 'sup-1': // Sam (Customer Tickets)
        return {
          bgColor: 'transparent',
          svg: (
            <image href="/GIF/Sam.png" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" />
          )
        };

      default: // Custom fallback avatar
        const colors = ['#F97316', '#10B981', '#7C3AED', '#DC2626', '#14B8A6', '#EC4899', '#FBBF24', '#4F46E5', '#2563EB', '#D97706'];
        const bgColor = colors[hashVal % colors.length];

        const skinTones = ['#FED7AA', '#FFEDD5', '#FDBA74'];
        const skinColor = skinTones[(hashVal >> 1) % skinTones.length];

        const hairColors = ['#1E293B', '#78350F', '#EAB308', '#991B1B'];
        const hairColor = hairColors[(hashVal >> 2) % hairColors.length];

        const hairGeometries = [
          <path key="h0" d="M12 25 L16 12 L22 15 L28 10 L34 16 L40 11 L45 17 L48 25 Z" fill={hairColor} stroke="#000" strokeWidth="2.5" />,
          <path key="h1" d="M15 26 C 15 13, 45 13, 45 26" fill={hairColor} stroke="#000" strokeWidth="2.5" />,
          <g key="h2" fill={hairColor} stroke="#000" strokeWidth="2">
            <circle cx="18" cy="20" r="6" />
            <circle cx="42" cy="20" r="6" />
            <circle cx="23" cy="15" r="7" />
            <circle cx="37" cy="15" r="7" />
            <circle cx="30" cy="13" r="8" />
          </g>,
          <path key="h3" d="M 18 21 C 22 15, 38 15, 42 21" fill="none" stroke={hairColor} strokeWidth="4.5" strokeLinecap="round" />
        ];
        const hairSvg = hairGeometries[(hashVal >> 3) % hairGeometries.length];

        const accessories = [
          <g key="a0">
            <circle cx="24" cy="27" r="4.5" fill="none" stroke="#000" strokeWidth="2.5" />
            <circle cx="36" cy="27" r="4.5" fill="none" stroke="#000" strokeWidth="2.5" />
            <line x1="28.5" y1="27" x2="31.5" y2="27" stroke="#000" strokeWidth="2.5" />
          </g>,
          <g key="a1">
            <path d="M 18 25 L 42 25 L 40 30 L 20 30 Z" fill="#000" stroke="#000" strokeWidth="2" />
            <line x1="19" y1="27" x2="41" y2="27" stroke="#FFF" strokeWidth="1" />
          </g>,
          <g key="a2">
            <path d="M18 24 C 18 16, 42 16, 42 24" fill="none" stroke="#000" strokeWidth="2.5" />
            <rect x="16" y="22" width="3" height="7" rx="1" fill="#000" />
            <rect x="41" y="22" width="3" height="7" rx="1" fill="#000" />
            <path d="M 41 26 C 41 33, 33 35, 31 35" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="30" cy="35" r="1.5" fill="#000" />
          </g>,
          <g key="a3">
            <circle cx="25" cy="27" r="2" fill="#000" />
            <circle cx="35" cy="27" r="2" fill="#000" />
            <path d="M 22 23 Q 25 21 28 23" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 32 23 Q 35 21 38 23" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          </g>
        ];
        const accessorySvg = accessories[(hashVal >> 4) % accessories.length];

        const mouths = [
          <path key="m0" d="M 24 33 Q 30 37 36 33" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />,
          <path key="m1" d="M 25 33 Q 30 38 35 33 Q 30 32 25 33" fill="#DC2626" stroke="#000" strokeWidth="2" />,
          <line key="m2" x1="26" y1="34" x2="34" y2="34" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
        ];
        const mouthSvg = mouths[(hashVal >> 5) % mouths.length];

        return {
          bgColor,
          svg: (
            <g>
              {/* Hair */}
              {hairSvg}
              {/* Face */}
              <circle cx="30" cy="28" r="11" fill={skinColor} stroke="#000" strokeWidth="2.5" />
              {/* Eyes / Glasses */}
              {accessorySvg}
              {/* Mouth */}
              {mouthSvg}
            </g>
          )
        };
    }
  };

  const config = getAvatarConfig();

  return (
    <div 
      className={`rounded-2xl border-4 border-black relative overflow-hidden flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${className}`}
      style={{ backgroundColor: config.bgColor }}
    >
      {/* Background Pop-art details */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1px,_transparent_1px)] bg-[length:6px_6px]"></div>
      
      {/* Avatar Face Vector */}
      <svg 
        viewBox="0 0 60 60" 
        className="w-full h-full relative z-10"
      >
        {config.svg}
      </svg>
    </div>
  );
}
