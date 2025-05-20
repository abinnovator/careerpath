// page.tsx (or your notes listing component)

import NotesCard from "@/components/blogCard";
import WelcomeCard from "@/components/welcomeCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getNotes } from "@/lib/actions/general.action";
import React from "react";

const page = async () => {
  const user = await getCurrentUser();
  const notesResult = await getNotes({ userId: user?.id });
  const notes = notesResult?.success ? notesResult.data : [];

  return (
    <>
      <WelcomeCard type={"notes"} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {notes.map((note) => (
          <NotesCard type="Note" key={note.id} noteId={note.id} />
        ))}
        <NotesCard type="Add" />
      </div>
    </>
  );
};

export default page;
