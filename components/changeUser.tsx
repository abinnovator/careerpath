// components/ChangeUser.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";

import {
  updateUserDetails,
  getCurrentUser as fetchCurrentUser,
} from "@/lib/actions/auth.action";

interface ChangeUserProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ChangeUser = ({ isOpen, onOpenChange }: ChangeUserProps) => {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [userName, setUserName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = useRef(new AbortController());

  // Effect 1: Load user data only when the dialog opens
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      if (user) {
        setUserName(user.displayName || user.email || "");
      }
      setIsLoadingUser(false);
    };

    if (isOpen) {
      // Only load user data when the dialog opens
      loadUser();
    }
    // No else if for selectedFile here
  }, [isOpen]); // <-- Depend only on isOpen

  // Effect 2: Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when dialog closes
      setUserName("");
      setSelectedFile(null);
      setIsUpdating(false);
      setMessage("");
      setUploadProgress(0);
      setIsLoadingUser(true); // Reset loading state for next open
    }
  }, [isOpen]); // <-- Depend only on isOpen

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault(); // Keep this!
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setMessage(""); // Reset message on new file selection
      setUploadProgress(0); // Reset progress on new file selection
    } else {
      setSelectedFile(null);
      setMessage(""); // Clear message if file deselected
      setUploadProgress(0);
    }
  };

  const authenticator = async () => {
    try {
      const response = await fetch("/api/upload-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }
      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  const handleUploadAndSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setUploadProgress(0);

    if (!currentUser || !currentUser.id) {
      setMessage("You must be logged in to update your profile.");
      return;
    }

    setIsUpdating(true);
    let finalProfileImageUrl = currentUser.photoURL;

    try {
      if (selectedFile) {
        const file = selectedFile;
        let authParams;
        try {
          authParams = await authenticator();
        } catch (authError: any) {
          setMessage(authError.message || "Failed to authenticate for upload.");
          setIsUpdating(false);
          return;
        }
        const { signature, expire, token, publicKey } = authParams;

        const uploadResponse = await upload({
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: `profile_${currentUser.id}_${file.name}`,
          folder: `/user_profile_images/${currentUser.id}/`,
          onProgress: (event) => {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          },
          abortSignal: abortController.current.signal,
        });

        console.log("ImageKit Direct Upload response:", uploadResponse);
        finalProfileImageUrl = uploadResponse.url;
        setMessage("Image uploaded successfully.");
      } else {
        finalProfileImageUrl = currentUser.photoURL;
      }

      const updateDetailsResult = await updateUserDetails({
        uid: currentUser.id,
        name: userName,
        profileImageUrl: finalProfileImageUrl,
      });

      if (updateDetailsResult.success) {
        setMessage(
          (prev) => (prev ? prev + " " : "") + updateDetailsResult.message
        );
        onOpenChange(false); // Close dialog on success
        router.refresh(); // Trigger a re-fetch of server components
      } else {
        setMessage(
          (prev) =>
            (prev ? prev + " " : "") +
            (updateDetailsResult.message || "Failed to update user details.")
        );
      }
    } catch (error: any) {
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
        setMessage("Upload aborted.");
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid ImageKit request:", error.message);
        setMessage(`Invalid upload request: ${error.message}`);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("ImageKit Network error:", error.message);
        setMessage(`Network error during upload: ${error.message}`);
      } else if (error instanceof ImageKitServerError) {
        console.error("ImageKit Server error:", error.message);
        setMessage(`ImageKit server error: ${error.message}`);
      } else {
        console.error("General upload/update error:", error);
        setMessage(
          `An unexpected error occurred: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setIsUpdating(false);
      setUploadProgress(0);
    }
  };

  // It's crucial to always render the <Dialog> component itself
  // and let its 'open' prop control visibility.
  // The loading and login messages can be conditionally rendered *inside* the DialogContent.
  if (isLoadingUser && isOpen) {
    // Only show loading if dialog is open and loading
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <div>Loading user data...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentUser && isOpen) {
    // Only show login message if dialog is open and no user
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <div>Please log in to change your profile.</div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render the main dialog content
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile and image here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUploadAndSave} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="col-span-3"
              disabled={isUpdating}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profileImage" className="text-right">
              Image
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUpdating}
              />
            </div>
          </div>
          {selectedFile && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className="text-xs text-gray-500 text-center block mt-1">
                {uploadProgress}% uploaded
              </span>
            </div>
          )}
          {message && (
            <p
              className={`text-sm text-center mt-2 ${
                message.includes("success") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUser;
