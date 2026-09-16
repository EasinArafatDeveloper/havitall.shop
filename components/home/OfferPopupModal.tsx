'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, ExternalLink } from 'lucide-react';

interface PopupOffer {
  _id?: string;
  productId?: string;
  productName?: string;
  productSlug?: string;
  targetUrl?: string;
  posterImage: string;
  title?: string;
  isActive: boolean;
  showAsPopup: boolean;
  popupDelaySeconds?: number;
}

export default function OfferPopupModal({ initialOffer }: { initialOffer?: PopupOffer | null }) {
  const [offer, setOffer] = useState<PopupOffer | null>(initialOffer || null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = typeof window !== 'undefined' ? sessionStorage.getItem('havitall_poster_popup_dismissed') : null;
    if (isDismissed) return;

    async function fetchPopupOffer() {
      try {
        if (!offer) {
          const res = await fetch('/api/offers?popupOnly=true');
          const data = await res.json();
          if (data.success && data.offers && data.offers.length > 0) {
            const activePopup = data.offers[0];
            if (activePopup?.posterImage && activePopup?.isActive && activePopup?.showAsPopup !== false) {
              setOffer(activePopup);
              scheduleOpen(activePopup.popupDelaySeconds || 1);
            }
          }
        } else if (offer.isActive && offer.showAsPopup !== false && offer.posterImage) {
          scheduleOpen(offer.popupDelaySeconds || 1);
        }
      } catch (err) {
        console.error('Error loading poster popup:', err);
      }
    }

    function scheduleOpen(delaySec: number) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delaySec * 1000);
      return () => clearTimeout(timer);
    }

    fetchPopupOffer();
  }, []);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('havitall_poster_popup_dismissed', 'true');
    }
  };

  const handleClickPoster = () => {
    if (!offer) return;
    handleClose();
    
    // Determine destination URL
    let target = offer.targetUrl?.trim();
    if (!target) {
      target = offer.productSlug ? `/product/${offer.productSlug}` : (offer.productId ? `/product/${offer.productId}` : '/shop');
    }

    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank');
    } else {
      router.push(target);
    }
  };

  if (!isOpen || !offer || !offer.isActive || !offer.posterImage) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      {/* Dark backdrop blur */}
      <div 
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity cursor-pointer" 
      />

      {/* Pure Poster Image Container */}
      <div className="relative z-10 my-auto max-w-lg sm:max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close Poster"
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white border-2 border-white/30 flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Clickable Full Poster Image */}
        <div 
          onClick={handleClickPoster}
          className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/10 cursor-pointer group bg-slate-900"
        >
          <img
            src={offer.posterImage}
            alt={offer.title || 'Special Promotional Offer'}
            className="w-full h-auto max-h-[82vh] object-contain block group-hover:scale-[1.02] transition-transform duration-300 ease-out"
          />

          {/* Subtle hover pulse indicator */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-end justify-center pb-4">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
              <span>অফারটি দেখতে ক্লিক করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
