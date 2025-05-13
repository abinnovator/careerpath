import Image from "next/image";
import React from "react";

const BlogCard = () => {
  return (
    <div className="w-[360px] h-[415px] card-border overflow-hidden">
      <div className="card-interview">
        <Image
          src="/image.png"
          alt="Interview"
          width={500}
          height={90}
          className="rounded-[20px]"
        />
        <div className="flex flex-row">
          <div className="flex flex-col gap-4">
            <h2>Acing your interview</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
