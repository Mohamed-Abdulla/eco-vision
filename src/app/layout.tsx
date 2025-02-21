import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
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
        <LayoutProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
              {/* sidebar */}
              <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">{children}</main>
            </div>
          </div>
        </LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
