import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface UseDeviceTypeReturn {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  activeMode: 'mobile' | 'desktop';
  setManualOverride: (mode: 'auto' | 'mobile' | 'desktop') => void;
  manualOverride: 'auto' | 'mobile' | 'desktop';
}

export function useDeviceType(): UseDeviceTypeReturn {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [manualOverride, setManualOverrideState] = useState<'auto' | 'mobile' | 'desktop'>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('garos_device_override') as any) || 'auto';
    }
    return 'auto';
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setManualOverride = (mode: 'auto' | 'mobile' | 'desktop') => {
    setManualOverrideState(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('garos_device_override', mode);
    }
  };

  const detectedDeviceType: DeviceType =
    windowWidth < 540 ? 'mobile' : windowWidth < 1024 ? 'tablet' : 'desktop';

  const activeMode: 'mobile' | 'desktop' =
    manualOverride === 'mobile'
      ? 'mobile'
      : manualOverride === 'desktop'
      ? 'desktop'
      : detectedDeviceType === 'mobile'
      ? 'mobile'
      : 'desktop';

  return {
    deviceType: detectedDeviceType,
    isMobile: detectedDeviceType === 'mobile',
    isTablet: detectedDeviceType === 'tablet',
    isDesktop: detectedDeviceType === 'desktop',
    activeMode,
    setManualOverride,
    manualOverride,
  };
}
