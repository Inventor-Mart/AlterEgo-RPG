// Browser & In-App Notification Service for AlterEgo Daily Purpose Decrees & Morning Affirmations
import { soundEngine } from './soundEngine';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // e.g. "08:00"
  sound: boolean;
  inAppBanner: boolean;
  browserPush: boolean;
  lastNotifiedDate: string | null;
}

const STORAGE_KEY = 'alterego_notification_settings_v2';

export function isInsideIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' | 'iframe_restricted' {
  if (!isNotificationSupported()) return 'unsupported';
  if (isInsideIframe()) return 'iframe_restricted';
  return Notification.permission;
}

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? true,
        time: parsed.time || '08:00',
        sound: parsed.sound ?? true,
        inAppBanner: parsed.inAppBanner ?? true,
        browserPush: parsed.browserPush ?? true,
        lastNotifiedDate: parsed.lastNotifiedDate || null,
      };
    }
  } catch {}
  return {
    enabled: true,
    time: '08:00',
    sound: true,
    inAppBanner: true,
    browserPush: true,
    lastNotifiedDate: null,
  };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export interface PermissionResult {
  granted: boolean;
  permission: NotificationPermission | 'unsupported' | 'iframe_restricted';
  reason?: string;
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (!isNotificationSupported()) {
    return {
      granted: false,
      permission: 'unsupported',
      reason: 'Browser notifications are not supported on this device/browser.',
    };
  }

  if (isInsideIframe()) {
    return {
      granted: false,
      permission: 'iframe_restricted',
      reason:
        'This app is currently running inside an embedded preview frame. Web browsers block push permission requests inside iframes. Open the app in its own tab or install as PWA to enable OS push notifications. In-App Morning Alerts & Audio Chimes are fully active!',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    const current = getNotificationSettings();
    saveNotificationSettings({
      ...current,
      browserPush: granted,
    });
    return {
      granted,
      permission,
      reason: granted
        ? 'Browser notifications enabled!'
        : 'Permission was not granted in browser settings.',
    };
  } catch (err: any) {
    return {
      granted: false,
      permission: 'denied',
      reason: err?.message || 'Failed to request notification permission.',
    };
  }
}

export interface NotificationDispatchResult {
  deliveredInApp: boolean;
  deliveredNative: boolean;
  methodUsed: 'serviceWorker' | 'nativeApi' | 'inAppOnly';
  message: string;
}

/**
 * Fires the Daily Morning Affirmation notification.
 * Delivers via:
 * 1. In-App Morning Banner Toast (100% reliable in all environments, iframes, and mobile)
 * 2. Audio Chime (if sound enabled)
 * 3. Native OS Notification (ServiceWorker or Notification API, if permission granted)
 */
export async function sendAffirmationNotification(
  title: string,
  body: string,
  options?: {
    iconUrl?: string;
    affirmation?: any;
    bypassDateCheck?: boolean;
    playAudio?: boolean;
  }
): Promise<NotificationDispatchResult> {
  const settings = getNotificationSettings();

  // 1. Audio chime if enabled
  if (options?.playAudio !== false && settings.sound) {
    try {
      soundEngine.playCelestialChime();
    } catch {}
  }

  // 2. In-App Morning Decree Event (Always dispatched so App.tsx displays the top banner)
  let deliveredInApp = false;
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('alterego-morning-alert', {
          detail: {
            title,
            body,
            affirmation: options?.affirmation,
            timestamp: Date.now(),
          },
        })
      );
      deliveredInApp = true;
    } catch {}
  }

  // 3. Native OS Notification
  let deliveredNative = false;
  let methodUsed: 'serviceWorker' | 'nativeApi' | 'inAppOnly' = 'inAppOnly';
  let message = 'In-App Morning Banner displayed with celestial chime.';

  if (
    isNotificationSupported() &&
    !isInsideIframe() &&
    Notification.permission === 'granted' &&
    settings.browserPush
  ) {
    const cleanBody = body.length > 180 ? `${body.substring(0, 177)}...` : body;
    const notificationOptions = {
      body: cleanBody,
      icon: options?.iconUrl || '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'alterego-daily-affirmation',
      requireInteraction: false,
    };

    // Try Service Worker registration first (works on Android Chrome & modern desktop)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(`⚡ ${title}`, notificationOptions);
          deliveredNative = true;
          methodUsed = 'serviceWorker';
          message = 'Dispatched via Service Worker & In-App Banner.';
        }
      }
    } catch {
      // Fallback to standard Notification constructor
    }

    if (!deliveredNative) {
      try {
        const notif = new Notification(`⚡ ${title}`, notificationOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        deliveredNative = true;
        methodUsed = 'nativeApi';
        message = 'Dispatched via Browser Notification & In-App Banner.';
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  } else if (isInsideIframe()) {
    message = 'Delivered via In-App Morning Banner & Chime (Running in embedded preview frame).';
  } else if (isNotificationSupported() && Notification.permission !== 'granted') {
    message = 'Delivered via In-App Morning Banner (OS notification requires browser permission).';
  }

  return {
    deliveredInApp,
    deliveredNative,
    methodUsed,
    message,
  };
}
