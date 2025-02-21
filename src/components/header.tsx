import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { FC } from "react";

interface HeaderProps {}
export const Header: FC<HeaderProps> = async ({}) => {
  const authUser = await currentUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <UserButton />
      </div>
    </header>
  );
};
