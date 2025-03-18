import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Puzzle2D - Candy Themed Puzzle Game',
  description: 'A 2D puzzle game with a soft, cartoonish style inspired by candy and desserts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-pink-50 to-purple-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
