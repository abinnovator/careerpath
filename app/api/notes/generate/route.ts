import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "@/firebase/admin";
export async function GET() {
  return Response.json({ success: true, data: "Thank You" }, { status: 200 });
}
export async function POST(request: Request) {
  const { userid, id, notes } = await request.json();
  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions accoring to these notes = ${notes}
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const quiz = {
      interviewId: id,
      userid: userid,
      finalized: true,
      questions: questions,
    };
    const quizDoc = await db.collection("quizes").add(quiz);
    const quizData = { id: quizDoc.id, quiz };
    return Response.json({ success: true, data: quizData }, { status: 200 });
  } catch (e) {
    console.log(e);
    return Response.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
