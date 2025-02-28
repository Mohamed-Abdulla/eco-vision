import { Button } from "@/components/ui/button";
import { getAllRewards } from "@/utils/db/actions/reward.actions";
import { getOrCreateUser } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { Award, Crown, Trophy, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FC } from "react";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const [user, rewards] = await Promise.all([
    getOrCreateUser(userId).catch(() => null),
    getAllRewards().catch(() => []),
  ]);

  console.log({ rewards });

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Leaderboard</h1>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 flex justify-between items-center text-white">
          <Trophy className="h-10 w-10" />
          <span className="text-2xl font-bold">Top Performers</span>
          <Award className="h-10 w-10" />
        </div>

        {rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-lg text-gray-600">No rewards available at the moment.</p>
            <p className="text-sm text-gray-500">Start participating to earn rewards!</p>
            <Link href="/report">
              <Button className="mt-4">Report a Waste</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward, index) => (
                <LeaderboardRow
                  key={reward.id}
                  reward={reward}
                  index={index}
                  isCurrentUser={user?.id === reward.userId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const LeaderboardRow: FC<{ reward: any; index: number; isCurrentUser: boolean }> = ({
  reward,
  index,
  isCurrentUser,
}) => {
  const crownColors = ["text-yellow-400", "text-gray-400", "text-yellow-600"];
  return (
    <tr className={`${isCurrentUser ? "bg-indigo-50" : ""} hover:bg-gray-50 transition`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {index < 3 ? (
            <Crown className={`h-6 w-6 ${crownColors[index]}`} />
          ) : (
            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 flex items-center whitespace-nowrap">
        <User className="h-10 w-10 bg-gray-200 text-gray-500 p-2 rounded-full" />
        <span className="ml-4 text-sm font-medium text-gray-900">{reward.userName}</span>
      </td>
      <td className="px-6 py-4 flex items-center whitespace-nowrap">
        <Award className="h-5 w-5 text-indigo-500 mr-2" />
        <span className="text-sm font-semibold text-gray-900">{reward.points.toLocaleString()}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">
          Level {reward.level}
        </span>
      </td>
    </tr>
  );
};

export default Page;
