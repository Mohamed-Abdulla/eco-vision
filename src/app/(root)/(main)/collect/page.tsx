import { ITEMS_PER_PAGE } from "@/utils/constants";
import { getWasteCollectionTasksWithFilters } from "@/utils/db/actions/collection.actions";
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
    status?: string;
  }>;
}

const Page: FC<PageProps> = async ({ searchParams }) => {
  const { userId } = await auth();
  if (!userId) return redirect("/");

  const user = await getOrCreateUser(userId);
  if (!user || user.role !== "admin") return redirect("/");

  // Extract search query and current page from URL search params
  const searchParamsQuery = await searchParams;

  const query = searchParamsQuery?.query || "";
  const currentPage = parseInt(searchParamsQuery?.page || "1", 10);

  // Fetch paginated and filtered tasks directly from DB
  const { tasks, totalCount } = await getWasteCollectionTasksWithFilters({
    query,
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    status: searchParamsQuery?.status,
  });

  const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE);
  console.log("tasks", tasks);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Waste Collection Tasks</h1>
      <SearchBox />
      <Tasks tasks={tasks as CollectionTask[]} userId={user.id} userRole={user.role} />
      <Pagination pageCount={pageCount} />
    </div>
  );
};

export default Page;
