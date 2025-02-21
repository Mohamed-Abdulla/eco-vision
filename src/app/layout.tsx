import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { LayoutProvider } from "./providers/layout-provider";
const font = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eco Vision",
  description: "Waste Reporting and Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className}  antialiased`}>
        <ClerkProvider>
          <LayoutProvider>{children}</LayoutProvider>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
