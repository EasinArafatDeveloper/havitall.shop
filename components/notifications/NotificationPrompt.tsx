'use client';

import { useEffect, useRef } from 'react';

export default function NotificationPrompt() {
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration error:', err);
      });
    }

    const syncSubscription = async (perm: string, subscription?: any) => {
      try {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permission: perm,
            subscription: subscription || null,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (err) {
        console.error('Error syncing subscriber status:', err);
      }
    };

    const triggerNativePermission = async () => {
      if (hasRequestedRef.current) return;
      if (Notification.permission !== 'default') {
        // Already allowed or blocked, sync state with database
        syncSubscription(Notification.permission);
        return;
      }

      hasRequestedRef.current = true;

      try {
        // Request the native browser dialog directly
        const permission = await Notification.requestPermission();

        let subData: any = null;
        if ('serviceWorker' in navigator && permission === 'granted') {
          try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              subData = sub.toJSON();
            }
          } catch (e) {
            console.warn('Push subscription note:', e);
          }
        }

        // Save status to MongoDB (Allowed or Blocked)
        await syncSubscription(permission, subData);

        // If user allowed, trigger celebratory welcome notification
        if (permission === 'granted') {
          try {
            const welcomeNotif = new Notification('🎉 HavItAll নোটিফিকেশন চালু হয়েছে!', {
              body: 'ধন্যবাদ! আমাদের এক্সক্লুসিভ লাক্সারি অফার ও ফ্ল্যাশ ডিল সবার আগে আপনি পাবেন।',
              icon: '/favicon.ico',
            });
            welcomeNotif.onclick = () => {
              window.focus();
            };
          } catch (e) {
            console.warn('Welcome notification note:', e);
          }
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };

    // 1. Trigger automatically on page load
    const timer = setTimeout(() => {
      triggerNativePermission();
    }, 100);

    // 2. Also attach a one-time gesture trigger (for browsers that block non-gesture prompts)
    const handleFirstInteraction = () => {
      triggerNativePermission();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };
  }, []);

  // Listen for live broadcasts periodically and show native notification if permission is granted
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let lastBroadcastId = localStorage.getItem('havitall_last_broadcast_seen') || '';

    const checkBroadcast = async () => {
      try {
        const res = await fetch('/api/notifications/broadcast?latestOnly=true');
        const data = await res.json();
        if (data.success && data.broadcast) {
          const broadcast = data.broadcast;
          if (broadcast._id !== lastBroadcastId) {
            lastBroadcastId = broadcast._id;
            localStorage.setItem('havitall_last_broadcast_seen', broadcast._id);

            // Trigger real native browser notification
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title: broadcast.title,
                body: broadcast.message,
                icon: broadcast.icon || '/favicon.ico',
                url: broadcast.targetUrl || '/shop',
              });
            } else {
              const n = new Notification(broadcast.title, {
                body: broadcast.message,
                icon: broadcast.icon || '/favicon.ico',
                badge: '/favicon.ico',
              });
              n.onclick = () => {
                window.focus();
                if (broadcast.targetUrl) window.location.href = broadcast.targetUrl;
              };
            }
          }
        }
      } catch {
        // silent fail
      }
    };

    const initialTimer = setTimeout(checkBroadcast, 4000);
    const interval = setInterval(checkBroadcast, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  // No custom banner/modal rendered - direct native prompt only!
  return null;
}
