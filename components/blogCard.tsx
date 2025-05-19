import Image from "next/image";
import React from "react";

const NotesCard = ({ type }: { type: "Note" | "Add" }) => {
  return (
    <div className="w-[360px] h-[415px] card-border overflow-hidden">
      <div className=" card-blog">
        {type === "Note" ? (
          <>
            <Image
              src="/image.png"
              alt="Interview"
              width={500}
              height={90}
              className="rounded-[20px]"
            />
            <div className="">
              <div className="">
                <h2>Acing your interview</h2>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center text-center items-center">
            <p className="text-[126px] text-center lg:pt-20">+</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesCard;
