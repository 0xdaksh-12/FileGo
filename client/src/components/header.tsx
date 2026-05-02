import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/use-auth";
import { Avatar } from "./ui/avatar";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">share</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">FileGo</h1>
            </div>
          </Link>

          {!!user && (
            <nav className=" md:flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="default"
                    className="flex items-center space-x-2"
                  >
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Avatar
                        size="sm"
                        className="bg-gray-200 flex items-center justify-center font-semibold text-gray-700 uppercase"
                      >
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </Avatar>
                    )}
                    <span className="font-medium">
                      {user?.name || user?.email || "User"}
                    </span>
                    <span className="material-symbols-outlined text-gray-600 text-[18px]">expand_more</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    inset={false}
                    onClick={() => logout()} 
                    className="text-danger flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2 text-[20px]">logout</span> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
