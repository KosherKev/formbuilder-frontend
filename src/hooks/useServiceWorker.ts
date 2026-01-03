/**
 * useServiceWorker Hook - Manage service worker registration and updates
 */

import { useState, useEffect } from "react";

export interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isWaiting: boolean;
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isInstalled: false,
    isWaiting: false,
    registration: null,
    error: null,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    setState((prev) => ({ ...prev, isSupported: true }));

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("✅ Service Worker registered");

        setState((prev) => ({
          ...prev,
          isInstalled: true,
          registration,
        }));

        // Check for waiting service worker
        if (registration.waiting) {
          setState((prev) => ({ ...prev, isWaiting: true }));
        }

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New service worker available
                setState((prev) => ({ ...prev, isWaiting: true }));
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch (error: any) {
        console.error("❌ Service Worker registration failed:", error);
        setState((prev) => ({ ...prev, error }));
      }
    };

    registerServiceWorker();

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("[App] Message from SW:", event.data);

      if (event.data.type === "SYNC_TRIGGERED") {
        // Handle sync trigger
        window.dispatchEvent(new CustomEvent("sw-sync-triggered"));
      }
    });

    // Request persistent storage
    if ("storage" in navigator && "persist" in navigator.storage) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("✅ Storage will persist");
        } else {
          console.log("⚠️ Storage may be cleared under pressure");
        }
      });
    }
  }, []);

  // Skip waiting and activate new service worker
  const skipWaiting = () => {
    if (state.registration && state.registration.waiting) {
      state.registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Reload page after activation
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    }
  };

  // Unregister service worker
  const unregister = async () => {
    if (state.registration) {
      await state.registration.unregister();
      setState({
        isSupported: true,
        isInstalled: false,
        isWaiting: false,
        registration: null,
        error: null,
      });
      console.log("✅ Service Worker unregistered");
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  };

  // Check if can install PWA
  const canInstallPWA = () => {
    return "BeforeInstallPromptEvent" in window;
  };

  return {
    ...state,
    skipWaiting,
    unregister,
    requestNotificationPermission,
    canInstallPWA,
  };
}

export default useServiceWorker;
