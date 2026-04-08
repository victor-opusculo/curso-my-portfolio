import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: '%s | Meu portfolio', default: 'Meu portfolio' },
  description: "Curso V. Opus",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const darkMode = cookieStore.get('theme')?.value === 'dark' ? 'dark' : '';

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div id="growableToFooter">
          <header className="w-full relative block min-h-[200px] bg-neutral-300 dark:bg-neutral-700 pt-8">
            <Image
              className="pl-8"
              src="/logo-generic.svg"
              alt="Meu portfolio"
              width={300}
              height={200}
              loading="eager"
            />
            <div className="absolute bottom-0 w-full">
              NavBar
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
