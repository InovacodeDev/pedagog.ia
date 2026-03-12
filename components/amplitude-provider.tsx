"use client";

import * as React from 'react';
import amplitude from '@/lib/amplitude';

interface AmplitudeProviderProps {
  children: React.ReactNode;
  userId?: string;
}

/**
 * AmplitudeProvider component that handles user identification.
 * Initialization is handled by the lib/amplitude module.
 *
 * @param props - Component properties including children and optional userId.
 * @returns The children wrapped in the provider.
 */
export function AmplitudeProvider({
  children,
  userId,
}: AmplitudeProviderProps): React.ReactElement {
  React.useEffect(() => {
    if (userId) {
      try {
        amplitude.setUserId(userId);
      } catch (error: unknown) {
        console.error('Failed to set Amplitude UserId:', error);
      }
    }
  }, [userId]);

  return <>{children}</>;
}

