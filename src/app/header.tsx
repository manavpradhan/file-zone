
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignInButton, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
    return <div className="border-b py-4 bg-gray-50">
        <div className="container mx-auto justify-between flex items-center">
            <div>FileZone</div>
            <div className="flex gap-3 items-center">
                <OrganizationSwitcher />
                <UserButton />
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button>Sign In</Button>
                    </SignInButton>
                </SignedOut>
                <ModeToggle/>
            </div>
        </div>
    </div>
}