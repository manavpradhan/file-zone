"use client";

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
import { Protect } from "@clerk/nextjs";

function GetImage({ storageId }: { storageId: string }) {
  const imageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_URL}/getImage`);
  imageUrl.searchParams.set("storageId", storageId);

  return <img src={imageUrl.href} height="100px" width="200px" />;
}

function getFileUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

export function FileCardActions({
  file,
  isFavorited,
  trash,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
  trash?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const me = useQuery(api.users.getMe);
  const { toast } = useToast();

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            {trash ? (
              <AlertDialogDescription>
                This operation will restore your file.
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                This file will get moved to trash. You can restore it from
                there, if you want.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            {!trash ? (
              <AlertDialogAction
                onClick={async () => {
                  await deleteFile({
                    fileId: file._id,
                    // storageId: file.fileId,
                    // markAsDelete: true,
                  });
                  toast({
                    variant: "default",
                    title: "File deleted successfully",
                    description:
                      "The file is moved to trash! You can restore it in the trash.",
                  });
                  if (isFavorited) {
                    await toggleFavorite({ fileId: file._id });
                  }
                  setOpen(false);
                }}
              >
                Trash
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={async () => {
                  await restoreFile({
                    fileId: file._id,
                    // storageId: file.fileId,
                    // markAsDelete: true,
                  });
                  toast({
                    variant: "success",
                    title: "File restored successfully!",
                    description: "You can view it in all files section.",
                  });
                  setOpen(false);
                }}
              >
                Restore
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {!trash && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={async () => {
                  await toggleFavorite({ fileId: file._id });
                }}
              >
                {isFavorited ? (
                  <div className="flex gap-3 text-blue-800 items-center">
                    <StarOffIcon className="h-5 w-5" />
                    Unfavorite
                  </div>
                ) : (
                  <div className="flex gap-3 text-green-500 items-center">
                    <StarIcon className="h-5 w-5" />
                    Favorite
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => {
                  window.open(getFileUrl(file.fileId), "_blank");
                }}
              >
                <div className="flex gap-3 text-blue-800 items-center">
                  <DownloadIcon className="h-5 w-5" />
                  Download
                </div>
              </DropdownMenuItem>
            </>
          )}

          <Protect
            condition={(check) => {
              return check({ role: "org:admin" }) || file.userId === me?._id;
            }}
            fallback={<></>}
          >
            {!trash && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setOpen(true)}
            >
              {file.markAsDelete ? (
                <div className="flex gap-3 text-green-500 items-center">
                  <Undo className="h-5 w-5" />
                  Restore
                </div>
              ) : (
                <div className="flex gap-3 text-red-500 items-center">
                  <TrashIcon className="h-5 w-5" />
                  Delete
                </div>
              )}
            </DropdownMenuItem>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
