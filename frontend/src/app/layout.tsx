import type { Metadata } from "next";
import {Epilogue, Jost } from "next/font/google";
import "./globals.css";


export const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
});

export const jost = Jost({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "BioQR - Suivi",
  description: "Votre boîte à outils médicaux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="">
      <body className={epilogue.className}>
        {children}
      </body>
    </html>
  );
}
