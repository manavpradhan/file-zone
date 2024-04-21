"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DownloadIcon,
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  StarOffIcon,
  TrashIcon,
  Undo,
} from "lucide-react";

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { formatDistance, formatRelative, subDays } from "date-fns";
import { FileCardActions } from "./file-actions";

function GetImage({ storageId }: { storageId: string }) {
  const imageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_URL}/getImage`);
  imageUrl.searchParams.set("storageId", storageId);

  return <img src={imageUrl.href} height="100px" width="200px" />;
}

function getFileUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCard({
  file,
  myfavorites,
  trash,
}: {
  file: Doc<"files">;
  myfavorites: Doc<"favorites">[];
  trash: boolean;
}) {
  const typeIcons = {
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    image: <ImageIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  const isFavorited = myfavorites.some((fav) => fav.fileId === file._id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <p>{typeIcons[file.type]}</p>
          <div className="flex items-center w-full justify-between font-normal">
            <p>{file.name}</p>
            <FileCardActions
              file={file}
              isFavorited={isFavorited}
              trash={trash}
            />
          </div>
        </CardTitle>
        {/* <CardDescription>Card Description</CardDescription> */}
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" && (
          // <GetImage storageId={file.fileId.toString()} />
          <Image
            src={getFileUrl(file.fileId)}
            alt="image file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "pdf" && (
          <Image
            src={"/pdf.png"}
            alt="pdf file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "csv" && (
          <Image
            src={"/csv.png"}
            alt="csv file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
        {file.type === "txt" && (
          <Image
            src={"/txt.jpg"}
            alt="text file"
            height={75}
            width={150}
            className="mx-auto"
          />
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pb-3">
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm text-gray-400">Uploaded By</p>
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
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-3 pb-2">
            {isFavorited && (
              <StarIcon size={"20px"} className="text-green-500" />
            )}
            <DownloadIcon
              size={"20px"}
              onClick={() => {
                window.open(getFileUrl(file.fileId), "_blank");
              }}
              className="cursor-pointer"
            />
            <p>{file.type}</p>
          </div>
          <p className="text-sm text-gray-400 pb-3">
            {formatDistance(
              subDays(new Date(file._creationTime), 0),
              new Date(),
              {
                addSuffix: true,
              }
            )}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
