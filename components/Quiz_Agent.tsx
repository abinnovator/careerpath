"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
// import router from "next/router"; // Redundant
import { quiz_interviewer } from "@/constants"; // Still needed for the Vapi agent ID that asks questions

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

// Simplified AgentProps for solely asking quiz questions
interface AgentProps {
  userName: string;
  userId: string;
  questions: []; // The array of quiz questions to be asked
  // Removed interviewId as it's not directly managed by this component's function
}

const Agent = ({ userName, userId, questions }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]); // Keep for displaying transcript
  const [lastMessage, setLastMessage] = useState<string>(""); // Keep for displaying last message

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        setLastMessage(message.transcript);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("Vapi Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      // After quiz questions are asked, redirect to a general quiz page or homepage
      router.push("/"); // Or router.push('/') if you prefer the homepage
    }
  }, [callStatus, router]); // No interviewId in dependencies, as it's not a prop

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    let formattedQuestions = "";
    console.log(questions);
    if (questions && questions.length > 0) {
      formattedQuestions = questions
        .map((question) => `- ${question}`) // Assuming your Vapi agent expects a bulleted list
        .join("\n");
    } else {
      console.warn("No quiz questions provided for the agent to ask.");
    }

    await vapi.start(quiz_interviewer, {
      variableValues: {
        questions: formattedQuestions,
        username: userName,
        userid: userId,
      },
      clientMessages: [],
      serverMessages: [],
    });
  };

  const handleDisconect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      <div className="call-view">
        {/* Card for AI Quiz Asker */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="Ai Avatar"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Quiz Asker</h3> {/* Changed title for clarity */}
        </div>
        {/* Card for user */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="User avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75 ",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span>{isCallInactiveOrFinished ? "Start Quiz" : ". . ."}</span>{" "}
            {/* Changed button text */}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconect}>
            {" "}
            End Quiz {/* Changed button text */}
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
