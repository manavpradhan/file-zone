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

import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  GanttChartIcon,
  ImageIcon,
  MoreVertical,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

function GetImage({ storageId }: { storageId: string }) {
  const imageUrl = new URL(`${process.env.NEXT_PUBLIC_CONVEX_URL}/getImage`);
  imageUrl.searchParams.set("storageId", storageId);

  return <img src={imageUrl.href} height="100px" width="200px" />;
}

function getFileUrl(fileId: Id<"_storage">): string {
  return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
}

function FileCardActions({ file }: { file: Doc<"files"> }) {
  const [open, setOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const { toast } = useToast();

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete this file
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id, storageId: file.fileId });
                toast({
                  variant: "default",
                  title: "File deleted successfully",
                  description: "The file is removed from system",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex gap-3 items-center text-green-500 cursor-pointer"
            onClick={async () => {
              await toggleFavorite({ fileId: file._id });
            }}
          >
            <StarIcon className="h-5 w-5" />
            Favorite
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-3 items-center text-red-500 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="h-5 w-5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FileCard({ file }: { file: Doc<"files"> }) {
  const typeIcons = {
    txt: <FileTextIcon />,
    csv: <GanttChartIcon />,
    pdf: <FileTextIcon />,
    image: <ImageIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-3 items-center">
          <p>{typeIcons[file.type]}</p>
          <div className="flex items-center w-full justify-between">
            <p>{file.name}</p>
            <FileCardActions file={file} />
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
      <CardFooter className="flex items-center justify-between">
        {/* <p>{file._creationTime}</p> */}
        <Button
          onClick={() => {
            window.open(getFileUrl(file.fileId), "_blank");
          }}
        >
          Download
        </Button>
        <div>
          <p>{file.type}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
