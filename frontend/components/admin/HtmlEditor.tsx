"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "@/components/admin/tiptap.css";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function HtmlEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2], // 🔒 uniquement H2 (pas de H1)
        },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  /* ---------------------------------------------------------
     SYNC EXTERNE (IMPORTANT)
     Si la valeur change depuis le parent (IA, load, reset),
     on met à jour le contenu de l’éditeur.
  --------------------------------------------------------- */
  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();
    const next = value || "<p></p>";

    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  function safe(cmd: () => void) {
    return () => {
      if (!editor) return;
      cmd();
    };
  }

  return (
    <div className="border rounded p-2 bg-white">
      {/* TOOLBAR */}
      <div className="flex gap-2 border-b pb-2 mb-3 text-sm">
        <button
          onClick={safe(() => editor.chain().focus().toggleBold().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          <b>B</b>
        </button>

        <button
          onClick={safe(() => editor.chain().focus().toggleItalic().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          <i>I</i>
        </button>

        <button
          onClick={safe(() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          H2
        </button>

        <button
          onClick={safe(() => editor.chain().focus().toggleBulletList().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          • Liste
        </button>
      </div>

      {/* EDITOR */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] p-2"
      />
    </div>
  );
}
