"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { HeadingButton } from "@/components/tiptap-ui/heading-button";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ListButton } from "./tiptap-ui/list-button";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";

// Import your CSS files
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

import { LinkPopover } from "./tiptap-ui/link-popover";
import Link from "@tiptap/extension-link";
import { Button } from "./ui/button";
import { Heading } from "@tiptap/extension-heading";
import { createQuiz, updateNotes } from "@/lib/actions/general.action";

// If you're using Next.js for routing:
import { useRouter } from "next/navigation"; // Changed from 'next/router' if using App Router

const myEditorFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
});

type MyEditorFormValues = z.infer<typeof myEditorFormSchema>;

interface MyEditorProps {
  initialNoteData: {
    id?: string;
    title: string;
    notes: string;
    userId?: string;
  };
  // The onSave prop was not being used, but it's good to keep if you plan to use it
  // onSave: (values: { title: string; notes: string }) => Promise<void>;
  onGenerateQuiz?: () => void; // This prop is now overridden by the internal function, but can be kept for external triggers
}

export default function MyEditor({
  initialNoteData,
}: // onGenerateQuiz is now handled internally if using router.push
// You can still keep it as a prop if you need to trigger it externally without internal navigation
MyEditorProps) {
  // Initialize useRouter for navigation
  const router = useRouter();

  const form = useForm<MyEditorFormValues>({
    resolver: zodResolver(myEditorFormSchema),
    defaultValues: {
      title: initialNoteData.title || "",
      notes: initialNoteData.notes || "<p></p>",
    },
    reValidateMode: "onChange",
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: true,
        link: true,
        code: false, // Ensure code blocks are handled as expected if you have a custom extension for them
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "accent-blue" },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    ],
    content: initialNoteData.notes || "<p></p>",
  });

  console.log(initialNoteData.notes);

  // Effect to reset form and editor content when initialNoteData changes
  useEffect(() => {
    // Only reset if the values are actually different to prevent unnecessary re-renders
    if (
      form.getValues("title") !== initialNoteData.title ||
      form.getValues("notes") !== initialNoteData.notes
    ) {
      form.reset({
        title: initialNoteData.title,
        notes: initialNoteData.notes || "<p></p>",
      });
      // Update editor content only if it's different from the initial data
      if (editor && initialNoteData.notes !== editor.getHTML()) {
        editor.commands.setContent(initialNoteData.notes || "<p></p>", false);
      }
    }
  }, [initialNoteData, form, editor]); // Add form and editor to dependency array

  // Effect to update form's 'notes' field whenever editor content changes
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        form.setValue("notes", editor.getHTML(), { shouldValidate: true });
      };
      editor.on("update", handleUpdate);
      return () => {
        editor.off("update", handleUpdate);
      };
    }
  }, [editor, form]); // Add form to dependency array

  const onSubmit = async (values: MyEditorFormValues) => {
    await updateNotes({
      title: values.title,
      notes: values.notes || "",
      noteId: initialNoteData.id,
      userId: initialNoteData.userId,
    });
  };

  const handleGenerateQuiz = async () => {
    try {
      // Ensure initialNoteData.userId and initialNoteData.id are available
      if (!initialNoteData.userId || !initialNoteData.id) {
        console.error("User ID or Note ID is missing for quiz generation.");
        // Optionally, show a user-friendly error message
        return;
      }

      const data = await createQuiz({
        userid: initialNoteData.userId,
        id: initialNoteData.id,
        notes: initialNoteData.notes, // Pass the actual notes content, not the entire initialNoteData object
      });
      console.log(data);

      if (data && data.data.id) {
        router.push(`/quiz/${data.data.id}`); // Navigate to the quiz page
      } else {
        console.warn("Quiz created but no quizId returned for navigation.");
        // Optionally, handle this case, e.g., navigate to a generic quizzes page
        // router.push('/quizzes');
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      // Handle error, perhaps display a toast message to the user
    }
  };

  return (
    <section className="overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="pb-20">
            <div className="flex flex-row justify-between">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <Input
                        placeholder="New Notes"
                        className="text-3xl font-bold  border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="cursor-pointer">
                  Save
                </Button>
                <Button
                  type="button" // Important: set type to "button" to prevent form submission
                  onClick={handleGenerateQuiz} // Use the fixed function
                  className="cursor-pointer"
                >
                  Generate quiz
                </Button>
              </div>
            </div>
          </div>
          <div className="gap-2 w-full border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content min-h-16 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] flex flex-col">
            <EditorContext.Provider value={{ editor }}>
              <div
                className="tiptap-button-group"
                data-orientation="horizontal"
              >
                <HeadingButton
                  level={1}
                  editor={editor}
                  className="p-7" // Check if p-7 is intentional or if it's a typo for padding
                ></HeadingButton>
                <HeadingButton level={2} editor={editor}></HeadingButton>
                <HeadingButton level={3} editor={editor}></HeadingButton>
                <HeadingButton level={4} editor={editor}></HeadingButton>
                {/* Ensure your ListButton component correctly handles levels or remove if not needed */}
                <ListButton type="bulletList" editor={editor}></ListButton>
                <ListButton type="orderedList" editor={editor}></ListButton>
                <ListButton type="taskList" editor={editor}></ListButton>
                <LinkPopover editor={editor} />
              </div>
              <hr></hr>
              <EditorContent editor={editor} role="presentation" />
            </EditorContext.Provider>
          </div>
        </form>
      </Form>
    </section>
  );
}
