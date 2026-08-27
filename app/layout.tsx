import type { Metadata } from 'next';
import { Oswald, Roboto } from 'next/font/google';
import '@/app/globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FÚTBOL Y MÁS (FYM) — Comunidad y Noticias Interactivas',
  description: 'Plataforma interactiva de fútbol: vota en debates, participa en la porra, sigue partidos en directo y decide las noticias con la comunidad.',
  keywords: ['fútbol', 'debates de fútbol', 'la liga', 'champions league', 'porra', 'noticias deportivas'],
  authors: [{ name: 'Fútbol y Más' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'FÚTBOL Y MÁS (FYM) — No leas las noticias, decídelas',
    description: 'Opina, vota, reacciona y compite en tiempo real con miles de fanáticos del fútbol.',
    url: 'https://futbolymas.es',
    siteName: 'Fútbol y Más',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${oswald.variable} ${roboto.variable}`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-fym-accent selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
