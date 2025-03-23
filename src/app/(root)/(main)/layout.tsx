import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { getUnreadNotifications } from "@/utils/db/actions/notifications.actions";
import { getOrCreateUser, getUserBalance } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const userDetails = await getOrCreateUser(userId);

  if (!userDetails) {
    return redirect("/");
  }

  //fetch available balance
  const balance = await getUserBalance(userDetails?.id);
  const notifications: Notifications[] = (await getUnreadNotifications(userDetails.id)) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header balance={balance} userId={userDetails.id} notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar userRole={userDetails.role} />
        <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">{children}</main>
      </div>
    </div>
  );
}
