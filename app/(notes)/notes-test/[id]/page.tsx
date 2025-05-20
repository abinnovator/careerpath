import React from "react";
import { getNoteById } from "@/lib/actions/general.action";
import { RouteParams } from "@/types";
import { getCurrentUser } from "@/lib/actions/auth.action";
import MyEditor from "@/components/tiptapEditor";

interface RouteParams {
  params: {
    id: string;
  };
}

const page = async ({ params }: RouteParams) => {
  const { id } = await params; // Correct way to access id
  const user = await getCurrentUser();

  const noteData = await getNoteById({ noteId: id, userId: user?.id }); // Passing id as noteId
  console.log(noteData.data);
  // console.log(noteData.data.notes);

  return (
    <div>
      {/* <NotesEditor initialNoteData={noteData.data} currentUserId={user?.id} /> */}
      <MyEditor initialNoteData={noteData.data} />
    </div>
  );
};

export default page;
