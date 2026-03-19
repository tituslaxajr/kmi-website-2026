'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, Users, HeartHandshake, LayoutDashboard, X } from 'lucide-react'
import { getStories, getPartners, getMinistries } from '../../lib/api'

interface SearchResult {
  id: string
  label: string
  subtitle?: string
  category: string
  href: string
  icon: React.ComponentType<any>
}

const NAV_PAGES: SearchResult[] = [
  { id: 'dashboard', label: 'Dashboard', category: 'Pages', href: '/admin', icon: LayoutDashboard },
  { id: 'stories', label: 'Stories', category: 'Pages', href: '/admin/stories', icon: BookOpen },
  { id: 'partners', label: 'Partners', category: 'Pages', href: '/admin/partners', icon: Users },
  { id: 'ministries', label: 'Ministries', category: 'Pages', href: '/admin/ministries', icon: HeartHandshake },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function AdminSearchModal({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [allResults, setAllResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Load all searchable data once on open
  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.allSettled([getStories(), getPartners(), getMinistries()]).then(
      ([storiesRes, partnersRes, ministriesRes]) => {
        const results: SearchResult[] = []

        if (storiesRes.status === 'fulfilled') {
          const stories: any[] = Array.isArray(storiesRes.value)
            ? storiesRes.value
            : (storiesRes.value as any)?.stories || []
          stories.forEach((s: any) => {
            results.push({
              id: `story-${s.id}`,
              label: s.title || 'Untitled Story',
              subtitle: s.subtitle || s.category || '',
              category: 'Stories',
              href: `/admin/stories/${s.id}`,
              icon: BookOpen,
            })
          })
        }

        if (partnersRes.status === 'fulfilled') {
          const partners: any[] = Array.isArray(partnersRes.value)
            ? partnersRes.value
            : (partnersRes.value as any)?.partners || []
          partners.forEach((p: any) => {
            results.push({
              id: `partner-${p.id}`,
              label: p.name || p.organization || 'Unnamed Partner',
              subtitle: p.organization || p.location || '',
              category: 'Partners',
              href: `/admin/partners/${p.id}`,
              icon: Users,
            })
          })
        }

        if (ministriesRes.status === 'fulfilled') {
          const ministries: any[] = Array.isArray(ministriesRes.value)
            ? ministriesRes.value
            : (ministriesRes.value as any)?.ministries || []
          ministries.forEach((m: any) => {
            results.push({
              id: `ministry-${m.slug || m.id}`,
              label: m.name || 'Unnamed Ministry',
              subtitle: m.description || '',
              category: 'Ministries',
              href: `/admin/ministries/${m.slug || m.id}`,
              icon: HeartHandshake,
            })
          })
        }

        setAllResults(results)
        setLoading(false)
      }
    )
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = useCallback((): SearchResult[] => {
    const q = query.trim().toLowerCase()
    if (!q) return NAV_PAGES
    const content = allResults.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        (r.subtitle && r.subtitle.toLowerCase().includes(q))
    )
    const pages = NAV_PAGES.filter((p) => p.label.toLowerCase().includes(q))
    return [...pages, ...content].slice(0, 12)
  }, [query, allResults])

  const results = filtered()

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function navigate(href: string) {
    router.push(href)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (results[activeIndex]) navigate(results[activeIndex].href)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Group results by category
  const grouped: Record<string, SearchResult[]> = {}
  for (const r of results) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-covenant-navy/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-mist/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-mist/20">
          <Search size={16} className="text-slate-text/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search stories, partners, ministries..."
            className="flex-1 bg-transparent outline-none text-covenant-navy placeholder:text-slate-text/30"
            style={{ fontSize: '0.9375rem' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-text/30 hover:text-slate-text/60">
              <X size={14} />
            </button>
          )}
          <kbd
            className="text-slate-text/30 bg-field-sand px-1.5 py-0.5 rounded border border-mist/30"
            style={{ fontFamily: 'monospace', fontSize: '0.625rem' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {loading && (
            <p className="text-center text-slate-text/40 py-6" style={{ fontSize: '0.8125rem' }}>
              Loading...
            </p>
          )}
          {!loading && results.length === 0 && (
            <p className="text-center text-slate-text/40 py-6" style={{ fontSize: '0.8125rem' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          )}
          {!loading &&
            Object.entries(grouped).map(([category, items]) => {
              return (
                <div key={category}>
                  <p
                    className="px-4 py-1.5 text-slate-text/40 uppercase tracking-widest"
                    style={{ fontSize: '0.625rem', fontWeight: 600 }}
                  >
                    {category}
                  </p>
                  {items.map((item) => {
                    const globalIndex = results.indexOf(item)
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setActiveIndex(globalIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIndex === globalIndex
                            ? 'bg-covenant-navy/5 text-covenant-navy'
                            : 'text-slate-text hover:bg-field-sand/40'
                        }`}
                      >
                        <Icon
                          size={15}
                          className={activeIndex === globalIndex ? 'text-covenant-navy' : 'text-slate-text/40'}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {item.label}
                          </p>
                          {item.subtitle && (
                            <p className="truncate text-slate-text/40" style={{ fontSize: '0.75rem' }}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-mist/20 flex items-center gap-4 text-slate-text/30" style={{ fontSize: '0.6875rem' }}>
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
