import { useState, useEffect } from 'react';
import MobileLayout from '@/layouts/MobileLayout';
import DesktopLayout from '@/layouts/DesktopLayout';
import { MOBILE_BREAKPOINT } from '@/config';

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
