"use client";
import { Button } from "@/components/ui/button";
import { FC } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  pageCount: number;
}

export const Pagination: FC<PaginationProps> = ({ pageCount }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex justify-center">
      <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="mr-2">
        Previous
      </Button>
      <span className="mx-2 self-center">
        Page {currentPage} of {pageCount}
      </span>
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageCount || pageCount === 0}
        className="ml-2"
      >
        Next
      </Button>
    </div>
  );
};
