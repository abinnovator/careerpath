// components/ProfileAvatar.tsx
"use client";
import { signOut } from "firebase/auth";
import React, { useState, useEffect } from "react"; // <--- Import useEffect and useState
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import ChangeUser from "./changeUser"; // Correct import path
import { getCurrentUser } from "@/lib/actions/auth.action"; // <--- Import getCurrentUser

// Removed unused imports:
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogTrigger } from "@/components/ui/dialog";

const ProfileAvatar = () => {
  const router = useRouter();
  const [isChangeUserDialogOpen, setIsChangeUserDialogOpen] = useState(false);
  // Correctly initialize user state with a null or defined type
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);

  // Use useEffect to fetch user data when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
    // No dependencies means it runs once on mount.
    // If you need it to re-fetch on certain conditions, add them here.
  }, []); // Empty dependency array means it runs once on mount

  // This function can be called to re-fetch user data
  // For example, after the ChangeUser dialog closes (if successful update)
  const refreshUserData = async () => {
    const updatedUser = await getCurrentUser();
    setCurrentUser(updatedUser);
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("Client-side Firebase signOut successful.");

      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Server-side session cookie cleared successfully.");
        alert("You have been signed out.");
        router.push("/sign-in");
      } else {
        const errorData = await response.json();
        console.error("Server-side logout API failed:", errorData.message);
        alert(
          "Signed out on client, but server logout failed: " + errorData.message
        );
        router.push("/sign-in");
      }
    } catch (error: any) {
      console.error("Error during sign out process:", error);
      alert("An error happened during sign out: " + error.message);
    }
  };

  // Determine avatar fallback letters
  const avatarFallback = currentUser?.displayName
    ? currentUser.displayName[0].toUpperCase()
    : currentUser?.email
    ? currentUser.email[0].toUpperCase()
    : "CN"; // Default fallback if no name or email
  console.log(currentUser);
  return (
    <div className="justify-center items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            {/* Display the user's photoURL or a fallback image */}
            <AvatarImage
              urlEndpoint="https://ik.imagekit.io/ki5emlag8"
              src={currentUser?.profileImage || "/image.png"}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOutUser}>Sign Out</DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault(); // Prevent dropdown from closing immediately
              setIsChangeUserDialogOpen(true); // Open the dialog
            }}
          >
            Change User Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render ChangeUser as a controlled component */}
      <ChangeUser
        isOpen={isChangeUserDialogOpen}
        onOpenChange={(openState) => {
          setIsChangeUserDialogOpen(openState);
          // If the dialog is closing (openState is false), refresh the user data
          if (!openState) {
            refreshUserData(); // This will re-fetch currentUser in ProfileAvatar
          }
        }}
      />
    </div>
  );
};

export default ProfileAvatar;
