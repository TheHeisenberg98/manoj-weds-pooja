import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manoj Weds Pooja | Shubh Vivah',
  description: 'A celebration of love — Manoj & Pooja',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#1A0A0A',
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
