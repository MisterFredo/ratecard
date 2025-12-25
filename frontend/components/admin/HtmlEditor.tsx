"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function HtmlEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded p-2 bg-white">
      <div className="flex gap-2 border-b pb-2 mb-2 text-sm">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded">
          B
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded">
          I
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">
          H2
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded">
          UL
        </button>
      </div>

      <EditorContent editor={editor} className="prose prose-sm max-w-none" />
    </div>
  );
}
