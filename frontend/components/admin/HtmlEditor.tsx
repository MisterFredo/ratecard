"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

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
          levels: [2], // 🔒 uniquement H2
        },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: value || "<p></p>",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  /* ---------------------------------------------------------
     SYNC EXTERNE
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

  function setLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="border rounded p-2 bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 border-b pb-2 mb-3 text-sm">
        {/* BOLD */}
        <button
          onClick={safe(() => editor.chain().focus().toggleBold().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          <b>B</b>
        </button>

        {/* ITALIC */}
        <button
          onClick={safe(() => editor.chain().focus().toggleItalic().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          <i>I</i>
        </button>

        {/* UNDERLINE */}
        <button
          onClick={safe(() => editor.chain().focus().toggleUnderline().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          U
        </button>

        {/* H2 */}
        <button
          onClick={safe(() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          H2
        </button>

        {/* LIST */}
        <button
          onClick={safe(() => editor.chain().focus().toggleBulletList().run())}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          • Liste
        </button>

        {/* ALIGN LEFT */}
        <button
          onClick={safe(() =>
            editor.chain().focus().setTextAlign("left").run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          ⬅
        </button>

        {/* ALIGN CENTER */}
        <button
          onClick={safe(() =>
            editor.chain().focus().setTextAlign("center").run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          ⬌
        </button>

        {/* ALIGN RIGHT */}
        <button
          onClick={safe(() =>
            editor.chain().focus().setTextAlign("right").run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          ➡
        </button>

        {/* LINK */}
        <button
          onClick={setLink}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          🔗 Lien
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
