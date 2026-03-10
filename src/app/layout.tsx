// app/layout.tsx
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'typezap',
  description:
    'A minimal, beautiful typing speed test. Measure your WPM and accuracy with real quotes from the internet.',
  keywords: ['typing test', 'wpm', 'typing speed', 'typezap'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}>
        {children}
      </body>
    </html>
  );
}