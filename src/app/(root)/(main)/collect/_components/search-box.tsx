"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const SearchBox = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : ""); // Ensure valid string
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <Input
        type="text"
        placeholder="Search by area..."
        defaultValue={searchParams.get("query")?.toString() || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Button variant="outline" size="icon">
        <Search className="size-4" />
      </Button>
      {/* Status Filter Dropdown */}
      <Select onValueChange={handleFilterChange} defaultValue={searchParams.get("status") || "pending"}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="false_claim">False Claim</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
