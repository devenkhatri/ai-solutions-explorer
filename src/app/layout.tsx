import type {Metadata} from 'next';
// import { GeistSans } from 'geist/font/sans'; // Removed problematic import
// import { GeistMono } from 'geist/font/mono'; // Removed problematic import
import './globals.css';
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Removed Geist font imports as they were causing issues, using default sans-serif for now.

export const metadata: Metadata = {
  title: 'Solution Explorer',
  description: 'Explore available solutions in card format.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Removed Geist variable classes, rely on globals.css and Tailwind defaults */}
      <body className="font-sans antialiased">
      <Header />
        {children}
      <Toaster /> {/* Add Toaster component here */}
      </body>
    </html>
  );
}
