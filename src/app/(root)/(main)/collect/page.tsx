import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWasteCollectionTasks } from "@/utils/db/actions/collection.actions";
import { getOrCreateUser } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { Calendar, CheckCircle, Clock, MapPin, Search, Trash2, Weight } from "lucide-react";
import { redirect } from "next/navigation";
import { FC } from "react";

interface PageProps {}

const Page: FC<PageProps> = async ({}) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const user = await getOrCreateUser(userId);

  if (!user) {
    return redirect("/");
  }
  const tasks = ((await getWasteCollectionTasks()) as CollectionTask[]) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Waste Collection Tasks</h1>
      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search by area..."
          // value={searchTerm}
          // onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                {task.location}
              </h2>
              <StatusBadge status={task.status} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center relative">
                <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
                <span
                  // onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                  // onMouseLeave={() => setHoveredWasteType(null)}
                  className="cursor-pointer"
                >
                  {task.wasteType.length > 8 ? `${task.wasteType.slice(0, 8)}...` : task.wasteType}
                </span>
                {/* {hoveredWasteType === task.wasteType && (
                      <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        {task.wasteType}
                      </div>
                    )} */}
              </div>
              <div className="flex items-center">
                <Weight className="w-4 h-4 mr-2 text-gray-500" />
                {task.amount}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                {task.date}
              </div>
            </div>
            <div className="flex justify-end">
              {task.status === "pending" && (
                <Button
                  // onClick={() => handleStatusChange(task.id, 'in_progress')}

                  variant="outline"
                  size="sm"
                >
                  Start Collection
                </Button>
              )}
              {task.status === "in_progress" && task.collectorId === user?.id && (
                <Button
                  // onClick={() => setSelectedTask(task)}

                  variant="outline"
                  size="sm"
                >
                  Complete & Verify
                </Button>
              )}
              {task.status === "in_progress" && task.collectorId !== user?.id && (
                <span className="text-yellow-600 text-sm font-medium">In progress by another collector</span>
              )}
              {task.status === "verified" && <span className="text-green-600 text-sm font-medium">Reward Earned</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;

function StatusBadge({ status }: { status: CollectionTask["status"] }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-800", icon: Trash2 },
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    verified: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  };

  const { color, icon: Icon } = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center`}>
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}
