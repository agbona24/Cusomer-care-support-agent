import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dental Voice Agent - Dashboard',
  description: 'AI-powered voice assistant for dental clinic appointment management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
