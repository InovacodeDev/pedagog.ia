// lib/amplitude-server.ts
import { init, track, identify, flush, Identify } from '@amplitude/analytics-node';

// Initialize once
init(process.env.AMPLITUDE_API_KEY!);

export async function trackServerEvent<T extends import('./analytics-events').EventName>(
  eventName: T,
  userId?: string,
  eventProperties?: import('./analytics-events').EventProperties<T>
) {
  try {
    track(eventName, eventProperties, {
      user_id: userId,
    });

    // Ensure events are sent before function ends
    await flush().promise;
  } catch (error) {
    console.error('Failed to track server event:', error);
  }
}

export async function identifyServerUser(
  userId: string,
  userProperties?: import('./analytics-events').UserProperties
) {
  try {
    const identifyObj = new Identify();

    if (userProperties) {
      Object.entries(userProperties).forEach(([key, value]) => {
        if (value !== undefined) {
          identifyObj.set(key, value);
        }
      });
    }

    identify(identifyObj, {
      user_id: userId,
    });

    await flush().promise;
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}
