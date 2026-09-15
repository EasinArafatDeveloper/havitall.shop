'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BannerSlide {
  _id?: string;
  title?: string;
  subtitle?: string;
  image: string;
  buttonLink?: string;
  order?: number;
}

export default function HeroSlider({ initialBanners }: { initialBanners?: BannerSlide[] }) {
  const [banners, setBanners] = useState<BannerSlide[]>(initialBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch latest banners from API
  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (data.success) {
          setBanners(data.banners || []);
        }
      } catch (err) {
        console.error('Failed to load hero banners:', err);
      }
    }
    loadBanners();
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Autoplay (switches every 5 seconds)
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered, banners.length]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];
  const linkHref = current?.buttonLink || '/shop';

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 800 : -800,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 800 : -800,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    <section 
      className="relative overflow-hidden bg-slate-50 py-4 sm:py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/9] min-h-[220px] sm:min-h-[340px] md:min-h-[420px] select-none group">
          
          {/* Pure Poster Slide Container with Drag & Swipe Support */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current._id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  nextSlide();
                } else if (swipe > 100 || offset.x > 60) {
                  prevSlide();
                }
              }}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
            >
              <Link
                href={linkHref}
                className="block w-full h-full relative"
                draggable={false}
              >
                <img
                  src={current.image}
                  alt={current.title || 'Hero Poster'}
                  className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-[1.015]"
                />
                
                {/* Subtle luxury edge vignette */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Left Arrow Button */}
          {banners.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous poster"
              className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-slate-950 text-slate-800 hover:text-white border border-slate-200 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-200 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {banners.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next poster"
              className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-slate-950 text-slate-800 hover:text-white border border-slate-200 backdrop-blur-md flex items-center justify-center shadow-lg transition-all duration-200 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Bottom Slide Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-md">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to poster ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full h-2 ${
                    currentIndex === idx
                      ? 'w-7 sm:w-8 bg-slate-950 shadow-sm'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
