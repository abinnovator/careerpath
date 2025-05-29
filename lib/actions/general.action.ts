"use server";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";

import {
  Interview,
  GetLatestInterviewsParams,
  CreateFeedbackParams,
  GetFeedbackByInterviewIdParams,
  Feedback,
  CreateEvent,
  getEventByDate,
} from "@/types";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { title } from "process";
import { date } from "zod";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  if (!userId) {
    console.warn("⚠️ getLatestInterviews called with undefined userId");
    return null;
  }

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.role}\n`
      )
      .join("");

    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      areasForImprovement,
      strengths,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (e) {
    console.log("There was an error - ", e);
    return {
      success: false,
    };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (feedback.empty) return null;
  const feedbackDoc = feedback.docs[0];

  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function createEvent(params: CreateEvent) {
  const { date, title, description, tasks, userId } = params;
  try {
    const event = await db
      .collection("event")
      .add({ date, title, description, tasks, userId });
    return {
      success: true,
      message: "event created",
      data: event,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "An error occured",
    };
  }
}

export async function getEvents(userId: string) {
  try {
    const events = await db
      .collection("event")
      .where("date", "==", date)
      .where("userId", "==", userId)
      .get();

    return {
      success: true,
      message: "Got Event",
      data: events.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Could not get events",
    };
  }
}

export async function getEventByDate(params: getEventByDate) {
  const { date, userId } = params;
  try {
    const eventsSnapshot = await db
      .collection("event")
      .where("date", "==", date)
      .where("userId", "==", userId)
      .get();

    return {
      success: true,
      message: "Got Event",
      data: eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Could not get events",
    };
  }
}

export async function createNotes({
  title,
  notes,
  userId,
}: {
  title: string;
  notes: string;
  userId: string;
}) {
  try {
    const note = await db.collection("note").add({ title, notes, userId });
    return {
      success: true,
      message: "event created",
      noteid: note.id,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "An error occured",
    };
  }
}

export async function getNotes({ userId }: { userId: string }) {
  try {
    const events = await db
      .collection("note")
      .where("userId", "==", userId)
      .get();

    return {
      success: true,
      message: "Got Notes",
      data: events.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Could not get Notes",
    };
  }
}

export async function getNoteById({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  try {
    const noteDoc = await db.collection("note").doc(noteId).get();

    if (!noteDoc.exists) {
      return {
        success: false,
        message: "Note not found",
        data: null,
      };
    }

    const noteData = { id: noteDoc.id, ...noteDoc.data() };

    if (noteData.userId !== userId) {
      return {
        success: false,
        message: "Unauthorized access to note",
        data: null,
      };
    }

    return {
      success: true,
      message: "Got Note",
      data: noteData,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Could not get Note",
      data: null,
    };
  }
}

export async function updateNotes({
  title,
  notes,
  noteId,
}: {
  title: string;
  notes: string;
  userId: string;
  noteId: string;
}) {
  try {
    const note = await db.collection("note").doc(noteId).update({
      title: title,
      notes: notes,
    });

    return {
      success: true,
      message: "event created",
      noteid: note,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "An error occured",
    };
  }
}

export async function getQuizById({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) {
  try {
    const quizDoc = await db.collection("quizes").doc(id).get();

    if (!quizDoc.exists) {
      return {
        success: false,
        message: "Note not found",
        data: null,
      };
    }

    const quizData = { id: quizDoc.id, ...quizDoc.data() };

    if (quizData.userid !== userId) {
      return {
        success: false,
        message: "Unauthorized access to note",
        data: null,
      };
    }

    return {
      success: true,
      message: "Got Quiz",
      data: quizData,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Could not get Quiz",
      data: null,
    };
  }
}

// Define the shape of the data expected by the API
interface CreateQuizParams {
  notes: string;
  userid: string;
  id: string; // This is your noteId
}

// Define the shape of the API response for better type safety
interface QuizApiResponse {
  success: boolean;
  data?: string[] | string; // Data could be an array of questions or a success message
  error?: string;
  message?: string; // Add a message for clarity if needed
}

export async function createQuiz({
  notes,
  userid,
  id,
}: CreateQuizParams): Promise<QuizApiResponse> {
  try {
    console.log("Generating quiz for notes:", notes);
    console.log("Sending userId:", userid, "noteId:", id);
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"; // Add a local fallback for dev if needed

    const response = await fetch(`${baseUrl}/api/notes/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: userid,
        id: id,
        notes: notes,
      }),
    });

    const result: QuizApiResponse = await response.json();
    // console.log(result.data.quiz);
    if (response.ok && result.success) {
      // Removed alert
      return {
        success: true,
        data: result.data,
        message: "Quiz generated successfully!",
      };
    } else {
      // Removed alert
      console.error("Quiz generation error:", result);
      return {
        success: false,
        error: result.error || "Unknown error",
        message: result.message || "Failed to generate quiz.",
      };
    }
  } catch (apiError: any) {
    // Removed alert
    console.error("API call failed:", apiError);
    return {
      success: false,
      error: apiError.message || "Network error",
      message: "An unexpected error occurred while generating the quiz.",
    };
  }
}

interface Event {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  description?: string;
  tasks?: Record<string, string>;
  userId: string;
  completed: boolean;
}

// ... other actions like getFeedbackByInterviewId, getInterviewsByUserId, getLatestInterviews, etc.

export async function getEventsByMonthRange({
  startDate, // e.g., 'YYYY-MM-DD' for start of month
  endDate, // e.g., 'YYYY-MM-DD' for end of month
  userId,
}: {
  startDate: string;
  endDate: string;
  userId: string;
}) {
  try {
    const eventsSnapshot = await db
      .collection("event")
      .where("userId", "==", userId)
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .get();

    const eventsData = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: eventsData };
  } catch (error) {
    console.error("Error fetching events by month range:", error);
    return { success: false, message: "Failed to fetch events." };
  }
}
