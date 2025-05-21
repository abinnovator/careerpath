import React from "react";
// import { Button } from "@/components/ui/button";
import { getNoteById } from "@/lib/actions/general.action";
import { RouteParams } from "@/types";
import { getCurrentUser } from "@/lib/actions/auth.action";
// import { Textarea } from "@/components/ui/textarea";
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
  // console.log(noteData);

  return (
    // <div>
    //   <div className="flex flex-row justify-between">
    //     <h1 className="text-3xl">{noteData.data.title}</h1>

    //     <Button className="cursor-pointer">Save</Button>
    //   </div>
    //   <div className="pt-10">
    //     <Textarea className="h-screen" />
    //   </div>
    // </div>
    <MyEditor initialNoteData={noteData.data} />
  );
};

export default page;
