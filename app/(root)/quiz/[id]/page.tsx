// app/(root)/quizzes/[id]/page.tsx

import Agent from "@/components/Quiz_Agent";
import { getQuizById } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { RouteParams } from "@/types";

const page = async ({ params }: RouteParams) => {
  const { id } = await params; // Corrected: params is already an object, no need for await on it

  const currentUser = await getCurrentUser();
  const userId = currentUser?.id || "";
  console.log("Current UserId (from page.tsx):", userId);

  const userName = currentUser?.name || "Guest";

  const quiz = await getQuizById({ userId: userId, id: id });

  // --- Crucial step: Parse the questions string into a JavaScript array ---
  let parsedQuestions: string[] = [];
  if (quiz && quiz.data && typeof quiz.data.questions === "string") {
    try {
      parsedQuestions = JSON.parse(quiz.data.questions);
      // Double-check if parsing actually resulted in an array
      if (!Array.isArray(parsedQuestions)) {
        console.error("JSON.parse resulted in a non-array:", parsedQuestions);
        parsedQuestions = []; // Reset if not an array
      }
    } catch (parseError) {
      console.error("Error parsing quiz.data.questions string:", parseError);
      parsedQuestions = []; // Default to empty array on parse error
    }
  } else if (quiz && quiz.data && Array.isArray(quiz.data.questions)) {
    // If by some chance it's already an array, use it directly
    parsedQuestions = quiz.data.questions;
  }
  // --- End of parsing logic ---

  console.log(
    "Parsed questions sent to Agent (from page.tsx):",
    parsedQuestions
  );

  if (!quiz || !quiz.data || parsedQuestions.length === 0) {
    // Check parsedQuestions
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <p>Quiz not found or no questions available after parsing.</p>
      </div>
    );
  }

  return (
    <div>
      <Agent
        questions={parsedQuestions} // Pass the PARSED array here
        userId={userId}
        userName={userName}
      />
    </div>
  );
};

export default page;
