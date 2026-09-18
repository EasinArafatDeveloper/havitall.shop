'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // Navigation finished once the pathname actually updates
  useEffect(() => {
    setActive(false);
  }, [pathname]);

  // Show the bar the instant an internal link is clicked, before the new route mounts
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');
      if (!href || target === '_blank' || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      const destination = href.split('#')[0];
      const current = window.location.pathname + window.location.search;
      if (destination && destination !== current) {
        setActive(true);
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-route-progress" />
    </div>
  );
}
