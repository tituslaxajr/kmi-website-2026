"use client"
import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-mist/40 rounded-xl ${className}`}
    />
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-mist/25">
      <Skeleton className="w-full h-52 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-24 mt-2" />
      </div>
    </div>
  );
}

export function PartnerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-mist/25 p-5 flex items-center gap-5">
      <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function MinistryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-mist/25 p-5 space-y-3">
      <Skeleton className="w-full h-40 rounded-xl" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
