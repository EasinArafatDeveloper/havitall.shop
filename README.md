# HavItAll — Luxury & Lifestyle E-Commerce Sanctuary

A state-of-the-art luxury e-commerce platform built with Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, and MongoDB Atlas.

## ✨ Features

- 💎 **Modern Luxury Aesthetic**: Dark glassmorphic design, smooth animations, and curated luxury typography.
- 🖼️ **Interactive Hero Slider**: Touch/drag swipeable full-screen poster banner showcase with auto-play.
- 🛍️ **E-Commerce Experience**:
  - Hot Products and Department Category showcases
  - Slide-over Add-to-Cart Drawer with Free Shipping progress tracker & Promo Code Engine
  - Dynamic Shop Catalog with Price range slider, live Search dropdown, and Category filters
  - Detailed Product Pages with thumbnail switcher, color/size variant selector, tabs, and customer reviews
  - Multi-payment Checkout (bKash, Nagad, Visa/Mastercard, Cash on Delivery)
  - Interactive 5-stage Live Order Tracking with milestone timeline
- 🛡️ **Ultra-Secure Isolated Admin Panel**:
  - Hidden from storefront visitors (no buttons or links on public pages)
  - ID & Password protected auth portal (`/admin/login`)
  - Product Catalog Manager (Add, Edit, Delete, Stock, Badges)
  - Hero Slider Posters Manager (Add, Reorder, Delete full poster banners)
  - Categories & Department Manager
  - Live Orders Hub with Status Updates (`Confirmed`, `Packed`, `Shipped`, `Delivered`) and Tracking notes
- ⚡ **Resilient Architecture**: Dual-layer persistence with MongoDB Atlas & instant zero-latency memory cache fallback.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

Admin Panel: [http://localhost:3000/admin](http://localhost:3000/admin)
