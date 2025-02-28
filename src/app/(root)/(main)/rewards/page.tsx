import { Button } from "@/components/ui/button";
import { getAvailableRewards, getRewardTransactions } from "@/utils/db/actions/reward.actions";
import { getOrCreateUser, getUserBalance } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { ArrowDownRight, ArrowUpRight, Coins } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

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
  const rewards = (await getAvailableRewards(user.id)) || [];
  const filteredRewards = rewards.filter((reward) => reward.cost > 0);

  const handleRedeemReward = async (rewardId: string) => {
    if (!user) {
      toast.error("Please log in to redeem rewards.");
      return;
    }

    const reward = rewards.find((r) => r.id === rewardId);
    if (reward && balance >= reward.cost && reward.cost > 0) {
      try {
        if (balance < reward.cost) {
          toast.error("Insufficient balance to redeem this reward");
          return;
        }

        // // Update database
        // await redeemReward(user.id, rewardId);

        // // Create a new transaction record
        // await createTransaction(user.id, 'redeemed', reward.cost, `Redeemed ${reward.name}`);

        toast.success(`You have successfully redeemed: ${reward.name}`);
      } catch (error) {
        console.error("Error redeeming reward:", error);
        toast.error("Failed to redeem reward. Please try again.");
      }
    } else {
      toast.error("Insufficient balance or invalid reward cost");
    }
  };

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
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center">
                    {transaction.type === "earned_report" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500 mr-3" />
                    ) : transaction.type === "earned_collect" ? (
                      <ArrowUpRight className="w-5 h-5 text-blue-500 mr-3" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
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

        {/* <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Rewards</h2>
          <div className="space-y-4">
            {filteredRewards.length > 0 ? (
              filteredRewards.map((reward) => (
                <div key={reward.id} className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{reward.name}</h3>
                    <span className="text-green-500 font-semibold">{reward.cost} points</span>
                  </div>
                  <p className="text-gray-600 mb-2">{reward.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{reward.collectionInfo}</p>
                  {reward.id === 0 ? (
                    <div className="space-y-2">
                      <Button
                        // onClick={handleRedeemAllPoints}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={balance === 0}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Redeem All Points
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleRedeemReward(reward.id as string)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      disabled={balance < reward.cost}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Redeem Reward
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                  <p className="text-yellow-700">No rewards available at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Page;
