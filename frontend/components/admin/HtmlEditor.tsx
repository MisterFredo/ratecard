"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
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
          levels: [2],
        },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),

      // ✅ EXTENSION LINK
      Link.configure({
        openOnClick: false, // important en édition
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],

    content: value || "<p></p>",

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

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

  // 🔗 Ajouter / modifier lien
  function setLink() {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL du lien :", previousUrl || "");

    if (url === null) return; // cancel

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  return (
    <div className="border rounded p-2 bg-white">
      {/* TOOLBAR */}
      <div className="flex gap-2 border-b pb-2 mb-3 text-sm flex-wrap">
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
          onClick={safe(() =>
            editor.chain().focus().toggleBulletList().run()
          )}
          className="px-2 py-1 border rounded hover:bg-gray-100"
        >
          • Liste
        </button>

        {/* 🔗 BOUTON LIEN */}
        <button
          onClick={setLink}
          className={`px-2 py-1 border rounded hover:bg-gray-100 ${
            editor.isActive("link") ? "bg-blue-100" : ""
          }`}
        >
          🔗 Lien
        </button>

        {/* ❌ Supprimer lien */}
        {editor.isActive("link") && (
          <button
            onClick={safe(() =>
              editor.chain().focus().unsetLink().run()
            )}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            ❌ Retirer lien
          </button>
        )}
      </div>

      {/* EDITOR */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[200px] p-2"
      />
    </div>
  );
}
