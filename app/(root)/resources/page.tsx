import BlogCard from "@/components/blogCard";
import WelcomeCard from "@/components/welcomeCard";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <>
      <WelcomeCard type={"resources"} />
      <div className="flex flex-row gap-5">
        <BlogCard />
        <BlogCard />
        {/* <BlogCard /> */}
      </div>
    </>
  );
};

export default page;
