"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {

  const pathname = usePathname();

  return (
    <div className={`min-h-[80px] w-full mt-12 flex items-center ${pathname === "/" || pathname === "/#" ? "bg-transparent z-10 translate-y-10": "bg-gray-100"}`}>
      <div className="container mx-auto justify-between flex items-center">
        <div>FileZone</div>

        <Link className="text-blue-900 hover:text-blue-500" href="/#">
          Privacy Policy
        </Link>
        <Link
          className="text-blue-900 hover:text-blue-500"
          href="/#"
        >
          Terms of Service
        </Link>
        <Link className="text-blue-900 hover:text-blue-500" href="/#">
          About
        </Link>
      </div>
    </div>
  );
}
