// components/notes/NoteFormEditor.tsx
"use client"; // This component must be a Client Component

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { updateNotes } from "@/lib/actions/general.action"; // Your update server action

// 1. Define your form schema with Zod
const noteFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
});

// Infer the type from the schema
type NoteFormValues = z.infer<typeof noteFormSchema>;

// Define props for this component
interface NoteFormEditorProps {
  initialNoteData: {
    id: string;
    title: string;
    notes: string;
    userId: string;
    // Add any other properties your note object might have
  };
  currentUserId: string; // The ID of the currently logged-in user
}

const NotesEditor = ({
  initialNoteData,
  currentUserId,
}: NoteFormEditorProps) => {
  // Initialize react-hook-form
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: initialNoteData.title || "",
      notes: initialNoteData.notes || "",
    },
    reValidateMode: "onChange",
  });

  // Use useEffect to reset form if initialNoteData changes (e.g., navigating between notes)
  useEffect(() => {
    form.reset({
      title: initialNoteData.title,
      notes: initialNoteData.notes || "",
    });
  }, [initialNoteData, form]); // Depend on initialNoteData and form instance

  // Submission handler
  const onSubmit = async (values: NoteFormValues) => {
    if (!initialNoteData.id || !currentUserId) {
      alert("Error: Note ID or User ID is missing for update.");
      return;
    }

    const { success, message } = await updateNotes({
      noteId: initialNoteData.id,
      title: values.title,
      notes: values.notes || "",
    });

    if (success) {
      alert("Note saved successfully!");
      // Optionally:
      // - Show a success toast notification
      // - Disable save button temporarily
      // - Mark form as pristine/not dirty
    } else {
      alert(`Failed to save note: ${message}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-row justify-between items-center">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              // Removed the <h1> tag. Apply styling directly to Input.
              <FormItem className="">
                {" "}
                {/* Added back flex-grow and mr-4 for spacing */}
                <FormControl>
                  <Input
                    placeholder="Note Title"
                    // Changed text-3xl to a larger size, e.g., text-5xl
                    className="text-5xl font-bold text-white bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <div className=" flex flex-row gap-8">
            <Button type="submit" className="cursor-pointer">
              Save
            </Button>
            <Button className="cursor-pointer bg-blue-400">Create Quiz</Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Start writing your notes here..."
                  className="h-screen bg-transparent text-white border border-gray-700 rounded-md p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default NotesEditor;
