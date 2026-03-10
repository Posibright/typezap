// app/api/quotes/route.ts
import { NextResponse } from 'next/server';

const FALLBACK_QUOTES = [
  "The only way to do great work is to love what you do.",
  "In the middle of every difficulty lies opportunity.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final failure is not fatal it is the courage to continue that counts.",
  "Life is what happens when you are busy making other plans.",
  "The purpose of our lives is to be happy.",
  "Get busy living or get busy dying.",
  "You only live once but if you do it right once is enough.",
  "Many of life's failures are people who did not realize how close they were to success when they gave up.",
  "If you look at what you have in life you will always have more.",
  "If you look at what you do not have in life you will never have enough.",
  "Life is really simple but we insist on making it complicated.",
  "The greatest glory in living lies not in never falling but in rising every time we fall.",
  "Your time is limited so do not waste it living someone else's life.",
  "If life were predictable it would cease to be life and be without flavor.",
  "The whole secret of a successful life is to find out what is one's destiny to do and then do it.",
  "In order to write about life first you must live it.",
  "The big lesson in life is never be scared of anyone or anything.",
  "Sing like no one is listening love like you have never been hurt dance like nobody is watching and live like it is heaven on earth.",
];

export async function GET() {
  try {
    const response = await fetch('https://zenquotes.io/api/quotes', {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`ZenQuotes returned ${response.status}`);
    }

    const data = await response.json();

    // ZenQuotes returns [{ q: "quote text", a: "author", ... }, ...]
    const quotes: string[] = data
      .map((item: { q: string }) => item.q.trim())
      .filter((q: string) => q.length >= 30 && q.length <= 200);

    if (quotes.length === 0) {
      throw new Error('No usable quotes returned');
    }

    // Shuffle
    for (let i = quotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
    }

    return NextResponse.json({ quotes, source: 'zenquotes' });
  } catch (error) {
    console.error('Quote fetch failed, using fallback:', error);

    // Shuffle fallback
    const shuffled = [...FALLBACK_QUOTES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return NextResponse.json({ quotes: shuffled, source: 'fallback' });
  }
}
