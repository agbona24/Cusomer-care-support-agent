import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smile Dental Clinic - Dashboard',
  description: 'AI-powered voice assistant for dental clinic appointment management',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦷</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {children}
      </body>
    </html>
  );
}
