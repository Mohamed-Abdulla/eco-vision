import { Button } from "@/components/ui/button";
import { getRewardTransactions } from "@/utils/db/actions/reward.actions";
import { getOrCreateUser, getUserBalance } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async ({}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const user = await getOrCreateUser(userId);

  if (!user) {
    return redirect("/");
  }
  //fetch available rewards
  const balance = (await getUserBalance(user?.id)) || 0;
  const transactions = (await getRewardTransactions(user.id)) || [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Rewards</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full border-l-4 border-green-500 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Reward Balance</h2>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Coins className="w-10 h-10 mr-3 text-green-500" />
            <div>
              <span className="text-4xl font-bold text-green-500">{balance}</span>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-1 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden w-full">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[2fr_1fr_1fr] w-full p-4 border-b border-gray-200 last:border-b-0 items-center"
                >
                  <div className="flex items-center">
                    {transaction.type === "earned_report" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500 mr-3" />
                    ) : transaction.type === "earned_collect" ? (
                      <ArrowUpRight className="w-5 h-5 text-blue-500 mr-3" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <p className="font-medium text-gray-800">{transaction.description}</p>
                  </div>
                  <p className="text-gray-500">{transaction.date}</p>
                  <span
                    className={`font-semibold justify-self-end ${
                      transaction.type.startsWith("earned") ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction.type.startsWith("earned") ? "+" : "-"}
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="p-4 text-center text-gray-500">No transactions yet</p>
                <Link href="/report">
                  <Button className="mt-4">Report a Waste </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
