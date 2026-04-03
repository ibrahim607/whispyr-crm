import type { Metadata } from "next";
import { Roboto, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "CRM Pro",
  description: "A crm project build to manage customer relationships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${roboto.className} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
