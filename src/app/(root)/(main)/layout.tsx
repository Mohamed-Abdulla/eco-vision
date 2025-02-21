import { Header } from "@/components/header";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* sidebar */}
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
