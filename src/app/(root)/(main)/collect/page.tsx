import { ITEMS_PER_PAGE } from "@/utils/constants";
import { getWasteCollectionTasks } from "@/utils/db/actions/collection.actions";
import { getOrCreateUser } from "@/utils/db/actions/user.actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FC } from "react";
import { Pagination } from "./_components/pagination";
import { SearchBox } from "./_components/search-box";
import { Tasks } from "./_components/tasks";

interface PageProps {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}

const Page: FC<PageProps> = async ({ searchParams }) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }
  const user = await getOrCreateUser(userId);

  if (!user) {
    return redirect("/");
  }
  const tasks = ((await getWasteCollectionTasks()) as CollectionTask[]) || [];

  const searchTerm = await searchParams;
  const query = searchTerm?.query || "";
  const currentPage = parseInt(searchTerm?.page || "1", 10);

  console.log(query);

  const filteredTasks = tasks.filter((task) => task.location.toLowerCase().includes(query.toLowerCase()));
  const pageCount = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Waste Collection Tasks</h1>
      <SearchBox />
      <div className="space-y-4">
        <Tasks tasks={paginatedTasks} userId={user.id} />
      </div>
      <Pagination pageCount={pageCount} />
    </div>
  );
};

export default Page;
