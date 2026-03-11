import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SessionProvider } from 'next-auth/react';
import { SessionProviderWrapper } from '@/components/providers/sessionProvider';
import ConditionalLayout from '@/components/ConditionalLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'UniResolve — Unified AI Evaluation',
  description: 'UniResolve automates handwritten evaluation, MCQs and subjective grading using AI.',
  openGraph: {
    title: 'UniResolve — Unified AI Evaluation',
    description: 'Automating human evaluation with accuracy, fairness, and intelligence.',
    url: 'http://localhost:3000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute={'class'}
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
            <main>
              <SessionProviderWrapper>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </SessionProviderWrapper>
            </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
