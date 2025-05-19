"use client";
import dynamic from "next/dynamic";
import React from "react";

// Lazy load the server component
const WelcomeCard = dynamic(() => import("./welcomeCard"), {
  ssr: false, // optional: to avoid hydration mismatch if needed
});

const WelcomeCardWrapper = ({
  type,
}: {
  type: "inteview" | "calendar" | "resources";
}) => {
  return <WelcomeCard type={type} />;
};

export default WelcomeCardWrapper;
