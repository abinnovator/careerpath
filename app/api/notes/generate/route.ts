import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
export async function GET() {
  return Response.json({ success: true, data: "Thank You" }, { status: 200 });
}
// ... (your existing imports and setup)

export async function POST(request: Request) {
  const { userid, id, notes } = await request.json();
  try {
    const { text: rawQuizOutput } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions and answers according to these notes = ${notes}

        The questions are going to be read by a voice assistant, so do not use "/" or "*" or any other special characters which might break the voice assistant.

        Return the output as a single JSON object with two keys: "questions" and "answers".
        Each key should have an array of strings as its value.

        Example format:
        {
          "questions": ["Question 1?", "Question 2?", "Question 3?"],
          "answers": ["Answer 1.", "Answer 2.", "Answer 3."]
        }
      `,
    });

    // --- START OF MODIFICATION ---
    // Remove markdown code fences if present
    const cleanedJsonString = rawQuizOutput
      .replace(/```json\n|```/g, "")
      .trim();

    // Parse the cleaned JSON string output from the LLM
    const parsedQuizContent = JSON.parse(cleanedJsonString);
    // --- END OF MODIFICATION ---

    const quiz = {
      interviewId: id,
      userid: userid,
      finalized: true,
      questions: parsedQuizContent.questions, // Store the array of questions
      answers: parsedQuizContent.answers, // Store the array of answers
    };

    const quizDoc = await db.collection("quizes").add(quiz);
    const quizData = { id: quizDoc.id, quiz };
    return Response.json({ success: true, data: quizData }, { status: 200 });
  } catch (e) {
    console.error("Error generating quiz:", e); // Use console.error for errors
    return Response.json(
      { success: false, error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
