import { Button } from "@/components/ui/button";
import { link } from "fs";
import { FileIcon, StarIcon } from "lucide-react";
import Link from "next/link";

export function SideNav() {
    return (
        <div className="w-40 flex flex-col gap-4">
            <Link href={"/"}>
                <Button variant={"link"} className="flex gap-2 justify-start"><FileIcon size={"sm"}/>All Files</Button>
            </Link>
            <Link href={"/favorites"}>
                <Button variant={"link"} className="flex gap-2 justify-start"><StarIcon size={"sm"}/>favorites</Button>
            </Link>
        </div>
    )
}