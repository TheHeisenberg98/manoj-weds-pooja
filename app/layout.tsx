import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A0A0A',
};

export const metadata: Metadata = {
  title: 'Manoj Weds Pooja | Shubh Vivah',
  description: 'A celebration of love — Manoj & Pooja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
