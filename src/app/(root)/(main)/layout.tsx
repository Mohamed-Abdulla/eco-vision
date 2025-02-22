import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { getOrCreateUser, getUserBalance } from "@/utils/db/actions/user.actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const user = await currentUser();
  const role = user?.privateMetadata.role !== "ADMIN";
  if (!userId) {
    return redirect("/");
  }
  const userDetails = await getOrCreateUser(userId);

  if (!userDetails) {
    return redirect("/");
  }

  //fetch available balance
  const balance = await getUserBalance(userDetails?.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header balance={balance} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
