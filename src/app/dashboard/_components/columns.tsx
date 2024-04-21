"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileCardActions } from "./file-actions";
import { StarIcon } from "lucide-react";

function UserCell({ userId }: { userId: Id<"users"> }) {
  const userProfile = useQuery(api.users.getUserProfile, { userId: userId });

  return (
    <div className="flex gap-2 items-center text-sm">
      <Avatar>
        <AvatarImage
          src={
            userProfile?.image === "nil"
              ? "/delete_user.png"
              : userProfile?.image
          }
        />
        <AvatarFallback>User Avatar</AvatarFallback>
      </Avatar>
      {userProfile?.name === "deleted" ? (
        <p>{"Deleted User"}</p>
      ) : (
        <p>{userProfile?.name}</p>
      )}
    </div>
  );
}

export const columns: ColumnDef<Doc<"files"> & { isFavorited: boolean }>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <p className="w-[90px]">{row.original.name}</p>
          {row.original.isFavorited && (
            <StarIcon size={"20px"} className="text-green-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },

  {
    header: "Uploaded On",
    cell: ({ row }) => {
      return (
        <p className="text-sm text-gray-400 pb-3">
          {formatRelative(new Date(row.original._creationTime), new Date())}
        </p>
      );
    },
  },
  {
    header: "Uploaded By",
    cell: ({ row }) => {
      return <UserCell userId={row.original.userId} />;
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      return (
        <FileCardActions
          file={row.original}
          isFavorited={row.original.isFavorited}
        />
      );
    },
  },
];
