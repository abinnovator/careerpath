"use server";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";

const WelcomeCard = async ({
  type,
}: {
  type: "inteview" | "calendar" | "notes";
}) => {
  const user = await getCurrentUser();
  return (
    <section className="card-cta">
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>Welcome back, {user?.name}</h2>
        <p className="text-lg">
          {(type === "inteview" &&
            "Get Interview-Ready with AI-Powered Practice & Feedback") ||
            (type === "calendar" && "Plan your day and never be late!") ||
            (type === "notes" && "View your notes")}
        </p>

        {type === "inteview" && ( // Removed the outer curly braces
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Create an mock interview</Link>
          </Button>
        )}
      </div>

      <Image
        src="/robot.png"
        alt="robo-dude"
        width={400}
        height={400}
        className="max-sm:hidden"
      />
    </section>
  );
};

export default WelcomeCard;
