import { RouteParams } from "@/types";
import React from "react";

const page = ({ params }: RouteParams) => {
  const { id } = params;
  return <div>page</div>;
};

export default page;
