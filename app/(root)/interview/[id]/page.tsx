import Agent from "@/components/Agent";
import DisplayTechIcons from "@/components/DisplayTechicons";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewById } from "@/lib/actions/general.action";
import { getRandomInterviewCover } from "@/lib/utils";
import { RouteParams } from "@/types";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: RouteParams) => {
  const user = await getCurrentUser();
  const { id } = await params;
  const interview = await getInterviewById(id);

  if (!interview) redirect("/");
  console.log(interview);
  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="random tech interview Cover"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role}</h3>
          </div>
          <DisplayTechIcons techStack={interview.techstack} />
        </div>
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {interview.type}
        </p>
      </div>
      <Agent
        userName={user?.name}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        userImage={user?.profileImage || "/public/image.png"}
      />
    </>
  );
};

export default page;
