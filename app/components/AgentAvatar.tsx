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
          bgColor: '#F97316', // Orange
          svg: (
            <g>
              {/* Flowing Hair background */}
              <path d="M 12 40 C 10 20, 15 10, 30 10 C 45 10, 50 20, 48 40" fill="#450A0A" stroke="#000" strokeWidth="2.5" />
              {/* Face */}
              <circle cx="30" cy="26" r="10" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Cat Eye Sunglasses */}
              <path d="M21 23 L28 25 L29 23 L27 21 Z" fill="#000" stroke="#000" strokeWidth="1.5" />
              <path d="M39 23 L32 25 L31 23 L33 21 Z" fill="#000" stroke="#000" strokeWidth="1.5" />
              <line x1="29" y1="24" x2="31" y2="24" stroke="#000" strokeWidth="2" />
              {/* Red Lips */}
              <path d="M 26 31 Q 30 34 34 31 Q 30 30 26 31" fill="#DC2626" stroke="#000" strokeWidth="1.5" />
            </g>
          )
        };

      case 'mkt-3': // Gordon (SEO Blog Writer)
        return {
          bgColor: '#DC2626', // Red
          svg: (
            <g>
              {/* Face */}
              <circle cx="30" cy="28" r="11" fill="#FDBA74" stroke="#000" strokeWidth="2.5" />
              {/* Beanie Hat */}
              <path d="M 17 22 C 17 12, 43 12, 43 22 Z" fill="#F59E0B" stroke="#000" strokeWidth="2.5" />
              <rect x="15" y="20" width="30" height="4" rx="2" fill="#D97706" stroke="#000" strokeWidth="2" />
              {/* Glasses */}
              <circle cx="25" cy="27" r="3.5" fill="none" stroke="#000" strokeWidth="2" />
              <circle cx="35" cy="27" r="3.5" fill="none" stroke="#000" strokeWidth="2" />
              {/* Beard */}
              <path d="M 22 34 Q 30 39 38 34" fill="none" stroke="#000" strokeWidth="2.5" />
            </g>
          )
        };

      case 'dev-3': // Quinn (Testing Engineer)
        return {
          bgColor: '#FBBF24', // Yellow
          svg: (
            <g>
              {/* Ponytail background */}
              <path d="M 38 18 C 45 18, 50 25, 48 35 C 46 40, 42 40, 40 35 Z" fill="#78350F" stroke="#000" strokeWidth="2" />
              {/* Face */}
              <circle cx="28" cy="26" r="10" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Front Hair */}
              <path d="M 18 22 C 22 18, 34 18, 38 22" fill="none" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
              {/* Bold Glasses */}
              <rect x="20" y="22" width="6" height="5" rx="1" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
              <rect x="30" y="22" width="6" height="5" rx="1" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
              <line x1="26" y1="24.5" x2="30" y2="24.5" stroke="#4C1D95" strokeWidth="2.5" />
            </g>
          )
        };

      case 'dev-4': // Cy (Security Compliance)
        return {
          bgColor: '#14B8A6', // Teal
          svg: (
            <g>
              {/* Cool spiky hair */}
              <path d="M15 22 L20 10 L25 15 L30 8 L35 15 L40 10 L45 22 Z" fill="#000" stroke="#000" strokeWidth="2.5" />
              {/* Face */}
              <circle cx="30" cy="28" r="11" fill="#FDBA74" stroke="#000" strokeWidth="2.5" />
              {/* Cyber Visor */}
              <path d="M 18 24 L 42 24 L 40 29 L 20 29 Z" fill="#22C55E" stroke="#000" strokeWidth="2" />
              <line x1="18" y1="26" x2="42" y2="26" stroke="#fff" strokeWidth="1" />
            </g>
          )
        };

      case 'mkt-1': // Marcus (Twitter Campaigner)
        return {
          bgColor: '#7C3AED', // Purple
          svg: (
            <g>
              {/* Messy curly hair */}
              <path d="M16 20 C 12 12, 48 12, 44 20" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="round" />
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FED7AA" stroke="#000" strokeWidth="2.5" />
              {/* Headset mic */}
              <path d="M 38 28 L 41 28 L 41 33 L 36 33" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              <circle cx="35" cy="33" r="1.5" fill="#000" />
              {/* Ear pads */}
              <rect x="18" y="24" width="3" height="8" rx="1.5" fill="#000" />
              <rect x="39" y="24" width="3" height="8" rx="1.5" fill="#000" />
            </g>
          )
        };

      case 'mkt-4': // Vic (Video Editor Script)
        return {
          bgColor: '#4F46E5', // Indigo
          svg: (
            <g>
              {/* Creative hair */}
              <path d="M 16 22 C 10 10, 50 10, 44 22" fill="#0F172A" stroke="#000" strokeWidth="3.5" />
              {/* Face */}
              <circle cx="30" cy="28" r="11" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Sunglasses */}
              <rect x="21" y="24" width="7" height="6" rx="1" fill="#000" />
              <rect x="32" y="24" width="7" height="6" rx="1" fill="#000" />
              <line x1="28" y1="27" x2="32" y2="27" stroke="#000" strokeWidth="2" />
            </g>
          )
        };

      case 'sales-1': // Sarah (Cold SDR Outreach)
        return {
          bgColor: '#EC4899', // Pink
          svg: (
            <g>
              {/* Bob hair */}
              <path d="M 15 28 C 15 15, 45 15, 45 28" fill="#EAB308" stroke="#000" strokeWidth="2.5" />
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Sales Mic */}
              <path d="M 38 28 C 38 34, 30 36, 28 36" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="27" cy="36" r="1.5" fill="#000" />
            </g>
          )
        };

      case 'sales-2': // Larry (Leads B2B Miner)
        return {
          bgColor: '#06B6D4', // Cyan
          svg: (
            <g>
              {/* Side parted hair */}
              <path d="M 16 22 C 20 12, 44 14, 44 22 Z" fill="#1E293B" stroke="#000" strokeWidth="2.5" />
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FED7AA" stroke="#000" strokeWidth="2.5" />
              {/* Square Wire Glasses */}
              <rect x="22" y="24" width="6" height="5" fill="none" stroke="#000" strokeWidth="1.5" />
              <rect x="32" y="24" width="6" height="5" fill="none" stroke="#000" strokeWidth="1.5" />
              <line x1="28" y1="26.5" x2="32" y2="26.5" stroke="#000" strokeWidth="1.5" />
            </g>
          )
        };

      case 'ops-1': // Holly (HR Specialist)
        return {
          bgColor: '#F43F5E', // Rose
          svg: (
            <g>
              {/* Curly hair */}
              <circle cx="16" cy="22" r="5" fill="#D1D5DB" stroke="#000" strokeWidth="1.5" />
              <circle cx="44" cy="22" r="5" fill="#D1D5DB" stroke="#000" strokeWidth="1.5" />
              <circle cx="20" cy="16" r="5" fill="#D1D5DB" stroke="#000" strokeWidth="1.5" />
              <circle cx="40" cy="16" r="5" fill="#D1D5DB" stroke="#000" strokeWidth="1.5" />
              <circle cx="30" cy="14" r="5" fill="#D1D5DB" stroke="#000" strokeWidth="1.5" />
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FDBA74" stroke="#000" strokeWidth="2.5" />
              {/* Smile */}
              <path d="M 25 31 Q 30 35 35 31" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            </g>
          )
        };

      case 'ops-2': // Finn (EBITDA Optimizer)
        return {
          bgColor: '#64748B', // Slate
          svg: (
            <g>
              {/* Bald/comb hair */}
              <line x1="18" y1="18" x2="42" y2="18" stroke="#000" strokeWidth="2" />
              {/* Face */}
              <circle cx="30" cy="28" r="11" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Monocle on right eye */}
              <circle cx="34" cy="26" r="3.5" fill="none" stroke="#000" strokeWidth="2" />
              <line x1="37.5" y1="26" x2="44" y2="30" stroke="#000" strokeWidth="1" />
            </g>
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
          bgColor: '#84CC16', // Lime
          svg: (
            <g>
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FFEDD5" stroke="#000" strokeWidth="2.5" />
              {/* Front Cap */}
              <path d="M 16 22 L 44 22 L 40 15 L 20 15 Z" fill="#DC2626" stroke="#000" strokeWidth="2.5" />
              <path d="M 12 22 L 20 22" stroke="#000" strokeWidth="3" strokeLinecap="round" />
            </g>
          )
        };

      case 'sup-1': // Sam (Customer Tickets)
        return {
          bgColor: '#8B5CF6', // Violet
          svg: (
            <g>
              {/* Support hair */}
              <path d="M 18 24 C 18 16, 42 16, 42 24" fill="none" stroke="#312E81" strokeWidth="3" />
              {/* Face */}
              <circle cx="30" cy="28" r="10" fill="#FED7AA" stroke="#000" strokeWidth="2.5" />
              {/* Headset */}
              <rect x="17" y="24" width="3" height="8" rx="1.5" fill="#000" />
              <path d="M 20 32 C 20 37, 26 37, 28 35" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="28" cy="35" r="1" fill="#000" />
            </g>
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
