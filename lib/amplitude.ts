'use client';

import * as amplitude from '@amplitude/unified';

const API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

/**
 * Initializes Amplitude on the client side.
 */
async function initAmplitude() {
  if (typeof window === 'undefined' || !API_KEY) return;
  
  try {
    // Using explicit configuration to avoid CORS issues on localhost
    // and hitting endpoints often blocked by anti-tracking tools.
    await amplitude.initAll(API_KEY, {
      analytics: {
        autocapture: true,
        useBatch: false, // Use standard API
        // Points to our local proxy in next.config.mjs to bypass CORS
        serverUrl: '/api/amplitude-analytics/2/httpapi',
        transport: 'fetch',
        minIdLength: 1,
      },
      sessionReplay: {
        sampleRate: 1,
        // Optional: points replay to its respective proxy if supported in this SDK version
        // serverUrl: '/api/amplitude-replay', 
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
