"use client"
import { useState, useEffect, createContext, useContext } from "react";
import { getPageImages } from "../lib/api";
import { IMAGES } from "../data/mockData";
import { MINISTRY_IMAGES } from "../data/ministryData";

// Combined default images
const DEFAULT_IMAGES: Record<string, string> = {
  ...IMAGES,
  // Ministry images prefixed to avoid collision
  "ministry_heroOverview": MINISTRY_IMAGES.heroOverview,
  "ministry_feeding": MINISTRY_IMAGES.feeding,
  "ministry_childSponsorship": MINISTRY_IMAGES.childSponsorship,
  "ministry_seniorCitizen": MINISTRY_IMAGES.seniorCitizen,
  "ministry_ofw": MINISTRY_IMAGES.ofw,
};

// Export the full list of image slot definitions for the admin page
export interface ImageSlot {
  key: string;
  label: string;
  page: string;
  desc: string;
}

export const IMAGE_SLOTS: ImageSlot[] = [
  // Home page
  { key: "hero", label: "Hero Background", page: "Home", desc: "Main homepage hero banner (full viewport)" },
  { key: "gathering", label: "Media Highlight", page: "Home", desc: "Video/media section thumbnail" },
  { key: "cinematicOcean", label: "Scripture Background", page: "Home", desc: "Cinematic scripture section backdrop" },
  // Stories
  { key: "children", label: "Hero Background", page: "Stories", desc: "Stories page hero banner" },
  // Partners
  { key: "worship", label: "Hero Background", page: "Partners", desc: "Partners page hero banner" },
  // Impact
  { key: "sunrise", label: "Hero Background", page: "Impact & Give", desc: "Shared hero for Impact and Give pages" },
  // About
  { key: "family", label: "Hero Background", page: "About", desc: "About page hero banner" },
  // Contact
  { key: "prayer", label: "Hero Background", page: "Contact", desc: "Contact page hero banner" },
  // Ministries landing
  { key: "ministry_heroOverview", label: "Hero Background", page: "Ministries", desc: "Ministries landing page hero" },
  // Ministry card/detail images
  { key: "ministry_feeding", label: "Feeding Program", page: "Ministries", desc: "Feeding program card & hero image" },
  { key: "ministry_childSponsorship", label: "Child Sponsorship", page: "Ministries", desc: "Child sponsorship card & hero image" },
  { key: "ministry_seniorCitizen", label: "Senior Citizen", page: "Ministries", desc: "Senior citizen care card & hero image" },
  { key: "ministry_ofw", label: "OFW Families", page: "Ministries", desc: "OFW families card & hero image" },
  // Additional images used across pages
  { key: "school", label: "School / Education", page: "Shared", desc: "Used in stories and media gallery" },
  { key: "elder", label: "Elder Portrait", page: "Shared", desc: "Used in media gallery" },
  { key: "volunteers", label: "Volunteers", page: "Shared", desc: "Used in media gallery" },
  { key: "pastor", label: "Pastor Portrait", page: "Shared", desc: "Used as fallback pastor image" },
  { key: "cinematicTerraces", label: "Rice Terraces", page: "Scripture BGs", desc: "Cinematic scripture background" },
  { key: "cinematicHands", label: "Children's Hands", page: "Scripture BGs", desc: "Cinematic scripture background" },
  { key: "cinematicMountain", label: "Mountain Fog", page: "Scripture BGs", desc: "Cinematic scripture background" },
  { key: "cinematicCross", label: "Cross / Worship", page: "Scripture BGs", desc: "Cinematic scripture background" },
  { key: "cinematicBible", label: "Open Bible", page: "Scripture BGs", desc: "Cinematic scripture background" },
  { key: "cinematicPalms", label: "Palm Trees", page: "Scripture BGs", desc: "Cinematic scripture background" },
];

// Group slots by page for admin display
export function getSlotsByPage(): { page: string; slots: ImageSlot[] }[] {
  const grouped = new Map<string, ImageSlot[]>();
  for (const slot of IMAGE_SLOTS) {
    const list = grouped.get(slot.page) || [];
    list.push(slot);
    grouped.set(slot.page, list);
  }
  return Array.from(grouped.entries()).map(([page, slots]) => ({ page, slots }));
}

// ─── Context for site-wide image overrides ───────────────────────────────
interface SiteImagesContextType {
  images: Record<string, string>;
  loading: boolean;
}

export const SiteImagesContext = createContext<SiteImagesContextType>({
  images: DEFAULT_IMAGES,
  loading: true,
});

export function useSiteImagesProvider() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageImages()
      .then((data) => {
        if (data && typeof data === "object") {
          setOverrides(data);
        }
      })
      .catch((e) => console.log("Using default page images, API unavailable:", e.message))
      .finally(() => setLoading(false));
  }, []);

  // Merge: overrides take priority, defaults fill the rest
  const images = { ...DEFAULT_IMAGES, ...overrides };

  return { images, loading };
}

// ─── Hook for consuming site images ──────────────────────────────────────
export function useSiteImages() {
  return useContext(SiteImagesContext);
}

// Convenience getters that mirror the old IMAGES / MINISTRY_IMAGES shape
export function useImages() {
  const { images } = useSiteImages();
  return images;
}
