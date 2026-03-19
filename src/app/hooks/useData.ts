"use client"
import { useState, useEffect } from "react";
import { getStories, getPartners, getMedia, getImpactStats } from "../lib/api";
import {
  stories as mockStories,
  partners as mockPartners,
  mediaItems as mockMedia,
  impactStats as mockImpact,
  type Story,
  type Partner,
  type MediaItem,
} from "../data/mockData";

export function useStories() {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStories(data.filter((s: Story) => s.published !== false));
        }
      })
      .catch((e) => console.log("Using mock stories, API unavailable:", e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stories, loading };
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPartners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPartners(data);
      })
      .catch((e) => console.log("Using mock partners, API unavailable:", e.message))
      .finally(() => setLoading(false));
  }, []);

  return { partners, loading };
}

export function useMediaItems() {
  const [items, setItems] = useState<MediaItem[]>(mockMedia);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMedia()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch((e) => console.log("Using mock media, API unavailable:", e.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading };
}

export function useImpactStats() {
  const [stats, setStats] = useState(mockImpact);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImpactStats()
      .then((data) => {
        if (data && typeof data === "object" && data.childrenSupported) setStats(data);
      })
      .catch((e) => console.log("Using mock impact stats, API unavailable:", e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
