// components/Header.tsx
'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header
      className="w-full flex items-center justify-between px-8 py-5"
      style={{
        borderBottom: '1px solid rgba(74, 69, 96, 0.15)',
      }}
    >
      {/* Logo – flat >_ without border box */}
      <Link href="/" className="flex items-center gap-3 group">
        <span
          style={{
            color: 'var(--purple-bright)',
            fontSize: '1.4rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            transition: 'color 0.2s ease',
          }}
        >
          &gt;_
        </span>
        <span
          style={{
            color: 'var(--purple-glow)',
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          typezap
        </span>
      </Link>

      {/* Nav – only analytics */}
      <nav className="flex items-center gap-1">
        <Link
          href="/analytics"
          title="analytics"
          className="relative flex items-center justify-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            color: 'var(--text-muted)',
            background: 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--purple-bright)';
            e.currentTarget.style.background = 'var(--bg-card)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}