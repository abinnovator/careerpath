import NotesCard from "@/components/blogCard";
import WelcomeCard from "@/components/welcomeCard";
import React from "react";

const page = () => {
  return (
    <>
      <WelcomeCard type={"notes"} />
      <div className="flex flex-row gap-5">
        <NotesCard type="Note" />
        <NotesCard type="Note" />
        <NotesCard type="Add" />

        {/* <BlogCard /> */}
      </div>
    </>
  );
};

export default page;
