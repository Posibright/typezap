// app/about/page.tsx
'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Simple header */}
      <header className="w-full flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(74, 69, 96, 0.15)' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <span style={{ color: 'var(--purple-bright)', fontSize: '1.4rem', fontWeight: 700 }}>
            &gt;_
          </span>
          <span style={{ color: 'var(--purple-glow)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            typezap
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs tracking-wider uppercase"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--purple-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← back to typing
        </Link>
      </header>

      <main className="flex-1 flex justify-center px-6 py-16">
        <article className="w-full" style={{ maxWidth: '640px' }}>
          <div className="fade-in-up flex flex-col gap-8">
            {/* Title */}
            <div className="flex flex-col gap-3">
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--purple-glow)',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                About typezap
              </h1>
              <div
                style={{
                  width: '60px',
                  height: '3px',
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, var(--purple-bright), var(--purple-dim))',
                }}
              />
            </div>

            {/* Content */}
            <Section title="The Story">
              <p>
                Honestly? keysharp started because I was annoyed. I was sitting in my 
                programming classes watching everyone else fly through their code while I 
                felt like I was typing through mud. I got tired of being the slow one in the
                 room, so in a "fine, I'll do it myself" moment, I decided to build my own 
                 trainer to fix it.
              </p>
            </Section>

            <Section title="What Makes It Different">
                <strong>Real sentences, not random words.</strong> Most typing sites 
                just give you "random words like apple house jump." Thats not how 
                we actually type. keysharp uses <strong>real sentences.</strong>
                Its built to help you practice the way you actually communicate and code—using logic, flow, 
                and actual rhythm. It is simple, fast, and built by someone 
                who actually needed it.
              <p>
                <strong>Infinite flow.</strong> In time mode, the text never runs out.
                As you approach the end, more words seamlessly appear. You type until the
                timer stops you — not the other way around.
              </p>
            </Section>

            <Section title="The Philosophy">
              <p>
               Typing shouldn't be a bottleneck for your ideas. It should be automatic. 
               We went with this deep purple "Amethyst" look because it’s easy on the eyes 
               and looks way cooler than a standard gray screen. The goal is to get you into
                a "flow state" where the keyboard disappears and the words just happen.
              </p>
              <p>
                The dark purple aesthetic isn't just for looks (though it does look
                great). It reduces eye strain during long practice sessions and puts the
                focus exactly where it belongs: on the words.
              </p>
            </Section>

            <Section title="Built With">
              <p>
                I used the latest tech to make sure there's zero lag—Next.js 15, React 19, 
                and Tailwind CSS v4. It's lightweight, snappy, and optimized so that the only 
                thing slow here is (hopefully) not your fingers.
              </p>
            </Section>

            <Section title="Open Source">
              <p>
                typezap is open source and always will be. Check out the code, contribute,
                or fork it to build your own version. The project lives on{' '}
                <a
                  href="https://github.com/posibright"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--purple-bright)', textDecoration: 'underline' }}
                >
                  GitHub
                </a>
                .
              </p>
            </Section>

            {/* Signature */}
            <div
              className="flex flex-col gap-2"
              style={{
                paddingTop: '16px',
                borderTop: '1px solid rgba(74, 69, 96, 0.2)',
              }}
            >
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Built with ☕ as well as mild backpain.
              </p>
              <p style={{ color: 'var(--text-untyped)', fontSize: '0.8rem' }}>
                — Posibright
              </p>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2
        style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--purple-bright)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div
        className="flex flex-col gap-3"
        style={{
          color: 'var(--text-correct)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
        }}
      >
        {children}
      </div>
    </div>
  );
}
