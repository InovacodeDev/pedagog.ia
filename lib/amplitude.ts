'use client';

import * as amplitude from '@amplitude/unified';

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

/**
 * Initializes Amplitude on the client side.
 */
async function initAmplitude() {
  if (typeof window === 'undefined' || !API_KEY) return;
  
  try {
    await amplitude.initAll(API_KEY, {
      analytics: {
        autocapture: true,
      },
      sessionReplay: {
        sampleRate: 1,
      },
    });
  } catch (error) {
    console.error('Amplitude initialization failed:', error);
  }
}

// Initialize immediately if on client side
if (typeof window !== 'undefined') {
  initAmplitude();
}

export const Amplitude = () => null;
export default amplitude;
