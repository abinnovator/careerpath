"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import { auth as clientAuth } from "@/firebase/client"; // Import client-side auth
import { sendPasswordResetEmail } from "firebase/auth"; // Import Firebase client-side function
import { toast } from "react-toastify"; // Or from "sonner" if you prefer that library
import { useState } from "react";
// import { FormType } from "@/types"; // If not used for conditional logic, can remove

const resetFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

// We can remove the 'type' prop if this form is exclusively for reset
const ResetForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const [loading, setLoading] = useState(false); // Add loading state

  async function onSubmit(values: z.infer<typeof resetFormSchema>) {
    const { email } = values;

    setLoading(true); // Set loading state
    try {
      // Direct call to client-side Firebase function
      await sendPasswordResetEmail(clientAuth, email); // Use clientAuth here

      toast.success("Password reset link sent! Check your inbox."); // Use toast.success for consistency and better UX
      router.push("/"); // Reroute to Home page after success
    } catch (error: any) {
      console.error("Error sending password reset email:", error); // Log the full error

      // Provide more specific error messages based on Firebase error codes
      if (error.code === "auth/user-not-found") {
        toast.error("No user found with that email address.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("The email address is not valid.");
      } else {
        toast.error(
          `Failed to send reset email: ${
            error.message || "An unexpected error occurred."
          }`
        );
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo-2.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">CareerPath</h2>
        </div>

        <h3>Reset Your Password</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <Button className="btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Reset Password"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
export default ResetForm;
