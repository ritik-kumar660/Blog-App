"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function PremiumEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Image.configure({
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    immediatelyRender: false,
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert prose-headings:font-bold focus:outline-none min-h-[300px] w-full max-w-none',
      },
    },
    onUpdate: ({ editor }: { editor: any }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 rounded-xl border border-border/50 bg-card/10 p-6 shadow-sm relative z-10">
      {/* Basic Floating Toolbar (can be expanded to Medium style bubble menu later) */}
      <div className="flex gap-2 border-b border-border/50 pb-4 mb-4">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('bold') ? 'bg-foreground/20 text-foreground' : 'text-muted-foreground'}`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('italic') ? 'bg-foreground/20 text-foreground' : 'text-muted-foreground'}`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-foreground/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-foreground/20 text-foreground' : 'text-muted-foreground'}`}
        >
          H2
        </button>
        <div className="w-px bg-border/50 mx-2" />
        <button
          onClick={() => {
            const url = window.prompt('URL');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors"
        >
          📷 Image
        </button>
      </div>

      <EditorContent editor={editor} className="min-h-[500px]" />
    </div>
  );
}
