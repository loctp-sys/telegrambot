import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { Mark, mergeAttributes } from '@tiptap/core';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon, Quote, EyeOff, Terminal, List, ListOrdered } from 'lucide-react';
import { useEffect } from 'react';

// Custom Spoiler Extension
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        spoiler: {
            toggleSpoiler: () => ReturnType,
            setSpoiler: () => ReturnType,
            unsetSpoiler: () => ReturnType,
        }
    }
}

const Spoiler = Mark.create({
    name: 'spoiler',

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    parseHTML() {
        return [
            {
                tag: 'tg-spoiler',
            },
            {
                tag: 'span',
                getAttrs: (element) => (element as HTMLElement).classList.contains('spoiler') && null,
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['tg-spoiler', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addCommands() {
        return {
            toggleSpoiler: () => ({ commands }) => {
                return commands.toggleMark(this.name)
            },
            setSpoiler: () => ({ commands }) => {
                return commands.setMark(this.name)
            },
            unsetSpoiler: () => ({ commands }) => {
                return commands.unsetMark(this.name)
            },
        }
    },
});


interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Telegram doesn't support headings well, prefer bold
                codeBlock: false, // We use separate extension or configure it manually
            }),
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'code-block',
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline',
                },
            }),
            Spoiler.configure({
                HTMLAttributes: {
                    class: 'spoiler',
                },
            }),
        ],
        content: content, // Initial content
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 border rounded-md',
            },
        },
        onUpdate: ({ editor }) => {
            // Get HTML, but simple cleaning might be needed if Tiptap adds extra stuff
            // For now, Tiptap's output is usually clean enough if configured right.
            // We use getHTML()
            const html = editor.getHTML();

            // Clean up: Tiptap might wrap things in <p>. 
            // Telegram supports <p> (adds newlines), so it's fine.
            onChange(html);
        },
    });

    // Sync content if it changes externally (e.g. loaded from DB)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only set if significantly different to avoid cursor jumps
            // For simple use case where content is loaded once, this is okay.
            // If typing updates 'content' prop which updates editor, it breaks cursor.
            // So we usually rely on initial content or check for emptiness.
            if (editor.getText() === '' && content !== '') {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);


    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="border rounded-md overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon={<Bold className="w-4 h-4" />}
                    title="Bold"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon={<Italic className="w-4 h-4" />}
                    title="Italic"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon={<UnderlineIcon className="w-4 h-4" />}
                    title="Underline"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon={<Strikethrough className="w-4 h-4" />}
                    title="Strike"
                />

                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

                <ToggleTool
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    icon={<Code className="w-4 h-4" />}
                    title="Inline Code"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon={<Terminal className="w-4 h-4" />}
                    title="Code Block"
                />
                <ToggleTool
                    onClick={() => (editor.chain().focus() as any).toggleSpoiler().run()} // Cast because TS doesn't know custom command
                    isActive={editor.isActive('spoiler')}
                    icon={<EyeOff className="w-4 h-4" />}
                    title="Spoiler (Hidden Text)"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon={<Quote className="w-4 h-4" />}
                    title="Quote"
                />

                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

                <ToggleTool
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    icon={<LinkIcon className="w-4 h-4" />}
                    title="Link"
                />

                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

                <ToggleTool
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon={<List className="w-4 h-4" />}
                    title="Bullet List"
                />
                <ToggleTool
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon={<ListOrdered className="w-4 h-4" />}
                    title="Numbers"
                />
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="min-h-[150px]" />

            <style>{`
                /* Tiptap Editor Styles */
                .ProseMirror {
                    padding: 1rem;
                    min-height: 150px;
                    outline: none;
                }
                .ProseMirror p {
                    margin-bottom: 0.5em;
                }
                /* Spoiler Style in Editor */
                tg-spoiler, .spoiler {
                    background-color: #e5e7eb;
                    color: transparent;
                    text-shadow: 0 0 5px rgba(0,0,0,0.5);
                    cursor: pointer;
                    border-radius: 4px;
                    padding: 0 4px;
                    transition: all 0.2s;
                }
                tg-spoiler:hover, .spoiler:hover {
                    color: inherit;
                    text-shadow: none;
                    background-color: #f3f4f6;
                }
                /* Code Block */
                pre {
                    background: #0d0d0d;
                    color: #fff;
                    font-family: 'JetBrainsMono', monospace;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                }
                code {
                    background-color: #f3f4f6;
                    padding: 0.1rem 0.3rem;
                    border-radius: 0.25rem;
                    font-family: monospace;
                    font-size: 0.9em;
                }
                 pre code {
                    background: none;
                    padding: 0;
                    color: inherit;
                    font-size: 0.8rem;
                }
                blockquote {
                    border-left: 3px solid #e5e7eb;
                    padding-left: 1rem;
                    margin-left: 0;
                    font-style: italic;
                }
            `}</style>
        </div>
    )
}

function ToggleTool({ onClick, isActive, icon, title }: { onClick: () => void, isActive: boolean, icon: React.ReactNode, title: string }) {
    return (
        <button
            type="button" // Prevent form submission
            onClick={onClick}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
            title={title}
        >
            {icon}
        </button>
    )
}
