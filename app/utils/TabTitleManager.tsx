"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TabTitleManager() {
  const pathname = usePathname();

  useEffect(() => {
    const getPageTitle = (path: string) => {
      switch (path) {
        case '/':
          return "Pixorva | Secure AI Dashboard";
        case '/employees':
          return "Pixorva | Marketplace";
        case '/pricing':
          return "Pixorva | Pricing & Plans";
        case '/settings':
          return "Pixorva | Settings";
        case '/studio':
          return "Pixorva | AI Agent Studio";
        case '/trial':
          return "Pixorva | 3-Day Free Trial";
        case '/login':
          return "Pixorva | Login";
        default:
          if (path.startsWith('/agent/')) {
            return "Pixorva | AI Workstation";
          }
          return "Pixorva";
      }
    };

    const normalTitle = getPageTitle(pathname);
    document.title = normalTitle;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "⬅ Come back to Pixorva!";
      } else {
        document.title = normalTitle;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
