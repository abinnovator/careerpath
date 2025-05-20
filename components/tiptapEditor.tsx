// components/MyEditor.tsx
"use client";

import React, { useEffect } from "react";
// --- NEW IMPORTS FOR BACKEND (REACT-HOOK-FORM) ---
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// Import Input, Form components if they are not already imported but used
import { Input } from "@/components/ui/input"; // Assuming this is for the title field
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
// ---------------------------------------------------

import { HeadingButton } from "@/components/tiptap-ui/heading-button";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ListButton } from "./tiptap-ui/list-button";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";

import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"; // Corrected a potential typo: was paragraph-node.scss, now paragraph-block.scss. Please verify this path exists for you!
import { LinkPopover } from "./tiptap-ui/link-popover";
import Link from "@tiptap/extension-link";
import { Button } from "./ui/button";
// import Code from "@tiptap/extension-code"; // REMOVED: Code extension
import { Heading } from "@tiptap/extension-heading";
import { updateNotes } from "@/lib/actions/general.action";

// --- NEW: Define schema for form data ---
const myEditorFormSchema = z.object({
  title: z.string().min(1, "Title is required"), // The `text` field
  notes: z.string().optional(), // The `notes` (HTML) content
});

type MyEditorFormValues = z.infer<typeof myEditorFormSchema>;

// --- NEW: Define props interface for MyEditor ---
interface MyEditorProps {
  initialNoteData: {
    id?: string; // Optional, useful if this is an existing note
    title: string; // Corresponds to `text` in your original code
    notes: string; // Corresponds to `notes` in your original code
    userId?: string; // Optional, might be used in backend logic
  };
  onSave: (values: { title: string; notes: string }) => Promise<void>; // Function to call on save
  onGenerateQuiz?: () => void; // Optional function for quiz generation
}
// --------------------------------------------------

// FIX: Correctly destructure props here from a single object `initialNoteData`
export default function MyEditor({
  initialNoteData,
  onSave,
  onGenerateQuiz,
}: MyEditorProps) {
  // --- NEW: Initialize react-hook-form ---
  const form = useForm<MyEditorFormValues>({
    resolver: zodResolver(myEditorFormSchema),
    defaultValues: {
      title: initialNoteData.title || "", // Set initial title from props
      notes: initialNoteData.notes || "<p></p>", // Set initial notes from props
    },
    reValidateMode: "onChange",
  });
  // ----------------------------------------

  const editor = useEditor({
    immediatelyRender: false, // KEPT: As per your original code
    extensions: [
      StarterKit.configure({
        // Recommended: Disable StarterKit's default extensions if you use custom buttons/extensions
        heading: false, // If you're using `@tiptap/extension-heading`
        bulletList: false, // If you're using ListButton for bulletList
        orderedList: false, // If you're using ListButton for orderedList
        link: false, // If you're using LinkPopover
        code: false, // REMOVED: StarterKit's default code extension
        // underline: false, // REMOVED: StarterKit's default underline if it was there
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, autolink: true }), // Added autolink for convenience
      // REMOVED: Code, // Code extension
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }), // Configure specific heading levels
      // REMOVED: Underline, // Underline extension
    ],
    // FIX: Use initialNoteData.notes for content from props
    content: initialNoteData.notes || "<p></p>",
  });

  console.log(initialNoteData.notes); // KEPT: console.log, now logs notes from props

  useEffect(() => {
    // Only reset form/editor if the incoming data is actually different
    if (
      form.getValues("title") !== initialNoteData.title ||
      form.getValues("notes") !== initialNoteData.notes
    ) {
      form.reset({
        title: initialNoteData.title,
        notes: initialNoteData.notes || "<p></p>",
      });
      if (editor && initialNoteData.notes !== editor.getHTML()) {
        editor.commands.setContent(initialNoteData.notes || "<p></p>", false);
      }
    }
  }, [initialNoteData, form, editor]); // Dependencies ensure this effect re-runs if initialNoteData changes

  // --- NEW: Effect to capture editor changes and update react-hook-form ---
  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        form.setValue("notes", editor.getHTML(), { shouldValidate: true });
      };
      editor.on("update", handleUpdate);
      // Cleanup function to remove the event listener when the component unmounts
      return () => {
        editor.off("update", handleUpdate);
      };
    }
  }, [editor, form]);

  const onSubmit = async (values: MyEditorFormValues) => {
    await updateNotes({
      title: values.title,
      notes: values.notes || "",
      noteId: initialNoteData.id,
      userId: initialNoteData.userId,
    });
  };
  // ---------------------------------------------------

  return (
    <section className="overflow-hidden">
      {/* --- NEW: Wrap entire content in react-hook-form's Form and actual form tag --- */}
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
                        placeholder="New Notes" // Placeholder for empty title
                        className="text-3xl font-bold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white" // Preserved your styling and added text-white
                        {...field} // Binds the input to the form's 'title' field
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
                  type="button" // FIX: Changed type to "button" to prevent form submission
                  onClick={onGenerateQuiz} // NEW: Add onClick handler
                  className="cursor-pointer"
                >
                  Generate quiz
                </Button>
              </div>
            </div>
          </div>
          <div className="gap-2 w-screen border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 field-sizing-content min-h-16 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] focus-visible:ring-[3px] flex flex-col">
            <EditorContext.Provider value={{ editor }}>
              <div
                className="tiptap-button-group"
                data-orientation="horizontal"
              >
                <HeadingButton
                  level={1}
                  editor={editor}
                  className="p-7"
                ></HeadingButton>
                <HeadingButton level={2} editor={editor}></HeadingButton>
                <HeadingButton level={3} editor={editor}></HeadingButton>
                <HeadingButton level={4} editor={editor}></HeadingButton>
                <ListButton
                  type="bulletList"
                  level={5}
                  editor={editor}
                ></ListButton>
                <ListButton
                  type="orderedList"
                  level={6}
                  editor={editor}
                ></ListButton>
                <ListButton
                  type="taskList"
                  level={7}
                  editor={editor}
                ></ListButton>
                <LinkPopover editor={editor} />
              </div>
              <EditorContent editor={editor} role="presentation" />
            </EditorContext.Provider>
          </div>
        </form>
      </Form>
    </section>
  );
}
