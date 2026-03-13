'use client';

import { useEffect } from 'react';
import { identifyUser, trackEvent } from '@/lib/amplitude';
import { getUserAnalyticsProfile } from '@/server/actions/analytics';

export function AmplitudeIdentify() {
  useEffect(() => {
    // Fetch profile and identify user on mount
    getUserAnalyticsProfile().then(({ userId, properties }) => {
      if (userId) {
        identifyUser(userId, properties);

        // Track Logged In once per session
        const hasTrackedLogin = sessionStorage.getItem('amplitude_login_tracked');
        if (!hasTrackedLogin) {
          trackEvent('User Logged In', {});
          sessionStorage.setItem('amplitude_login_tracked', 'true');
        }
      }
    });
  }, []);

  return null;
}
