import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'editimage — browser image editor',
  description: 'Import, edit, and export images directly in your browser. Non-destructive editing with filters, transforms, and crop.',
  openGraph: {
    title: 'editimage',
    description: 'Browser image editor — no uploads, private editing.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface-0 text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
