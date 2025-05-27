"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner"; // Using sonner based on your import
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification, // <--- IMPORT THIS
} from "@firebase/auth"; // Make sure @firebase/auth is correctly aliased to firebase/auth if needed,
// or just import from 'firebase/auth' directly.
import { auth } from "@/firebase/client"; // This is your client-side auth instance
import { signIn, signUp } from "@/lib/actions/auth.action";
import { FormType } from "@/types";

const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up"
        ? z.string().min(3, "Name must be at least 3 characters.")
        : z.string().optional(),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."), // Firebase generally requires 6+ chars
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        // 1. Create user with email and password in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, // Use your client-side auth instance
          email,
          password
        );

        const firebaseUser = userCredential.user; // Get the newly created Firebase User object

        // 2. Send Email Verification (Client-side)
        if (firebaseUser) {
          await sendEmailVerification(firebaseUser);
          toast.success(
            "Account created! A verification email has been sent. Please check your inbox."
          );
        }

        // 3. Store user details in Firestore via Server Action
        const result = await signUp({
          uid: firebaseUser.uid,
          name: name!,
          email,
          // password: password, // Password should not be stored in Firestore, Firebase Auth handles it
        });

        if (!result?.success) {
          // If the server-side action failed, log it and return
          console.error("Server-side signup failed:", result?.message);
          toast.error(result?.message || "Account creation failed on server.");
          // You might want to delete the Firebase Auth user here if Firestore fails
          // firebaseUser.delete();
          return;
        }

        // Successfully signed up and email sent
        toast.success(
          "Account created successfully. Please sign in and verify your email."
        );
        router.push("/sign-in");
      } else {
        // type === "sign-in"
        const { email, password } = values;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if (!idToken) {
          toast.error("Sign in failed");
          return;
        }

        const result = await signIn({
          email,
          idToken,
        });
        if (result?.code === "Email not verified") {
          toast(
            "Your email has not been verified. Please verrify your email to sign in."
          );
        }
        if (result?.code === "Wrong user credentials") {
          toast("The entered creadentials are wrong.");
        }
        console.log(process.env.FIREBASE_PROJECT_ID);
        toast.success("Sign in successfully.");
        router.push("/");
      }
    } catch (error: any) {
      // Type the error as 'any' or 'FirebaseError' if you have it
      console.error("Authentication error:", error); // Use console.error for errors
      // More specific error handling for sign-in/sign-up
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password.");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("The email address is not valid.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.");
      } else {
        toast.error(
          `There was an error: ${
            error.message || "An unexpected error occurred."
          }`
        );
      }
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo-2.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">CareerPath</h2>
        </div>

        <h3>Practice job interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />
            <div className="flex flex-col">
              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                formFieldType="password"
              />
              {isSignIn && (
                <Link
                  href="/reset"
                  className="text-sm text-blue-400 hover:underline text-right mt-1"
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            <Button className="btn" type="submit">
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
};
export default AuthForm;
