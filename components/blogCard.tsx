"use client";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  createNotes, // Corrected import to createNote (singular)
  getNoteById, // Corrected import to getNoteById (singular)
} from "@/lib/actions/general.action";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface NoteData {
  id: string;
  title: string;
  notes: string;
  userId: string;
}

const NotesCard = ({
  type,
  noteId,
}: {
  type: "Note" | "Add";
  noteId?: string;
}) => {
  const [userId, setUserId] = useState<string>();
  const [noteData, setNoteData] = useState<NoteData | null>(null); // Use a more specific type
  const router = useRouter();

  useEffect(() => {
    const fetchInitialUserId = async () => {
      const user = await getCurrentUser();
      const id = typeof user?.userId === "function" ? user.userId() : user?.id;
      setUserId(id);
    };

    const fetchNote = async () => {
      if (type === "Add" || !noteId || !userId) return;
      const { success, data } = await getNoteById({
        userId: userId,
        noteId: noteId,
      });
      if (success && data) {
        setNoteData(data);
      } else {
        console.error(
          "Failed to fetch note:",
          data?.message || "Unknown error"
        );
        // Optionally set a default state or handle the error in the UI
      }
    };

    fetchInitialUserId();
    fetchNote();
  }, [noteId, type, userId]);

  const handleCreateNote = async () => {
    if (!userId) return;

    const { success, noteid: newNoteId } = await createNotes({
      title: "New Notes",
      notes: "",
      userId: userId,
    });

    if (success && newNoteId) {
      toast("Created Notes Rerouting now", { className: "bg-[#17142f]" });
      router.push(`/notes/${newNoteId}`);
    } else {
      alert("Failed to create new notes.");
      toast("There was an error creating the notes.", {
        className: "bg-[#17142f]",
      });
    }
  };

  return (
    <div className="w-[360px] h-min-[415px] card-border overflow-hidden">
      <div className=" card-blog">
        {type === "Note" && noteData ? ( // Only render if type is Note AND noteData is available
          <>
            <Image
              src="/image.png"
              alt="Interview"
              width={500}
              height={90}
              className="rounded-[20px] w-full h-auto object-cover"
            />
            <div className="text-center flex flex-col gap-20 p-4">
              <div className=" flex flex-col justify-between">
                <h2 className="text-center">
                  {noteData?.title || "Untitled Note"}
                </h2>
              </div>
              <Button className="w-full">
                <Link href={`/notes/${noteData?.id}`}>View Note</Link>{" "}
              </Button>
            </div>
          </>
        ) : type === "Add" ? (
          <div className="flex justify-center text-center items-center h-full">
            {" "}
            {/* Center content */}
            <Button
              className="text-[126px] text-center bg-transparent hover:bg-transparent text-white cursor-pointer flex flex-col justify-center"
              onClick={handleCreateNote}
            >
              +
            </Button>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>Loading Note...</p> {/* Display a loading state */}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesCard;
