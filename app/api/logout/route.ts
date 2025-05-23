// app/api/logout/route.ts
// This runs on the server.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth as adminAuth } from "@/firebase/admin"; // Import your Firebase Admin Auth instance

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("session")?.value; // Get the session cookie you set

    if (sessionCookie) {
      try {
        // Optional but recommended: Revoke the session in Firebase Auth
        // This makes the session cookie instantly invalid, even if it's not deleted from the browser.
        const decodedClaims = await adminAuth.verifySessionCookie(
          sessionCookie
        );
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      } catch (e) {
        console.warn(
          "Could not revoke refresh token during logout, likely already invalid:",
          e
        );
        // Continue to delete cookie even if revocation fails (e.g., token already expired)
      }
    }

    // Delete the session cookie from the browser
    cookieStore.delete("session"); // <--- THIS IS THE CRITICAL LINE. Matches your 'session' cookie name.

    return NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during server-side logout:", error);
    return NextResponse.json(
      { success: false, message: "Server logout failed." },
      { status: 500 }
    );
  }
}
