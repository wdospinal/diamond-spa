'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { useCallback, useState, useEffect, useRef } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon,
  Minus, Undo, Redo,
  Code, Type,
} from 'lucide-react'

// ── Toolbar Button ────────────────────────────────────────────────────────────
function ToolBtn({
  onClick, active = false, disabled = false, title, children
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 text-xs transition-all flex items-center justify-center border
        ${active
          ? 'bg-primary/20 text-primary border-primary/40'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface border-transparent'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-6 bg-outline-variant/30 mx-1 shrink-0" />
}

// ── Main WYSIWYG Editor ───────────────────────────────────────────────────────
interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichEditor({ value, onChange, placeholder = 'Escribe el contenido aquí...' }: RichEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList:    { keepMarks: true, keepAttributes: false },
        orderedList:   { keepMarks: true, keepAttributes: false },
        code: false, // Desactivamos el inline code por defecto para usar el botón de HTML
      }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[300px] text-on-surface',
      },
      // Permite pegar HTML directo sin que se escape
      transformPastedHTML(html) {
        return html
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sincronizar cambios externos si los hay, pero evitando re-render loop
  useEffect(() => {
    if (editor && !editor.isFocused && !isHtmlMode) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value, { emitUpdate: false })
      }
    }
  }, [value, editor, isHtmlMode])

  // ── Insert Image via URL ────────────────────────────────────────────────────
  const handleImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL de la imagen (https://...):')
    if (url === null || url === '') return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  // ── Upload Image via File (Optimized to WebP) ─────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setUploading(true)
    try {
      // Import on demand to avoid SSR issues if any
      const { compressImageToWebP } = await import('@/lib/image-optimizer')
      const base64Url = await compressImageToWebP(file, 1000, 0.75) // Optimizado a WebP ligero
      editor.chain().focus().setImage({ src: base64Url, alt: file.name }).run()
    } catch (err) {
      alert('Error procesando la imagen.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [editor])

  // ── Insert Link ─────────────────────────────────────────────────────────────
  const handleLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url  = window.prompt('URL del enlace:', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={`border bg-surface-container overflow-hidden transition-all ${isHtmlMode ? 'border-primary/60' : 'border-outline-variant/50 focus-within:border-primary/60'}`}>

      {/* ── TOOLBAR ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-outline-variant/30 bg-surface-container/50">

        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo() || isHtmlMode} title="Deshacer">
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo() || isHtmlMode} title="Rehacer">
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} disabled={isHtmlMode} title="Párrafo">
          <Type className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} disabled={isHtmlMode} title="Título 2">
          <span className="text-[10px] font-black uppercase tracking-tight leading-none">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} disabled={isHtmlMode} title="Título 3">
          <span className="text-[10px] font-black uppercase tracking-tight leading-none">H3</span>
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} disabled={isHtmlMode} title="Negrita">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} disabled={isHtmlMode} title="Cursiva">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} disabled={isHtmlMode} title="Subrayado">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} disabled={isHtmlMode} title="Tachado">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} disabled={isHtmlMode} title="Lista viñetas">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} disabled={isHtmlMode} title="Lista numerada">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} disabled={isHtmlMode} title="Cita">
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={isHtmlMode} title="Separador">
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive('left')} disabled={isHtmlMode} title="Izquierda">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive('center')} disabled={isHtmlMode} title="Centrar">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive('right')} disabled={isHtmlMode} title="Derecha">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        <ToolBtn onClick={handleLink} active={editor.isActive('link')} disabled={isHtmlMode} title="Enlace">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        
        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isHtmlMode || uploading}
          title="Subir imagen desde el equipo"
          className={`p-2 text-xs transition-all flex items-center gap-1 border border-transparent
            ${uploading ? 'opacity-50 cursor-not-allowed text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">{uploading ? '...' : 'Subir'}</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

        {/* Insert Image URL Button */}
        <ToolBtn onClick={handleImage} disabled={isHtmlMode} title="Insertar imagen desde URL externa">
          <span className="text-[10px] font-bold">URL</span>
        </ToolBtn>

        <div className="ml-auto flex items-center">
          <ToolBtn onClick={() => setIsHtmlMode(!isHtmlMode)} active={isHtmlMode} title="Ver y editar código HTML">
            <Code className="w-3.5 h-3.5 mr-1" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{isHtmlMode ? 'Visual' : 'HTML'}</span>
          </ToolBtn>
        </div>
      </div>

      {/* ── EDITOR CONTENT ────────────────────────────────────────────────── */}
      <div className="p-4 md:p-6 rich-editor-content overflow-y-auto" style={{ maxHeight: '500px' }}>
        {isHtmlMode ? (
          <textarea
            className="w-full h-[300px] min-h-[300px] bg-transparent text-primary font-mono text-[13px] outline-none resize-y leading-relaxed"
            value={value}
            onChange={(e) => {
              const html = e.target.value
              onChange(html)
              editor.commands.setContent(html, { emitUpdate: false })
            }}
            placeholder="Escribe o pega tu código HTML aquí..."
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {/* Word Count */}
      <div className="px-4 pb-2 flex justify-end">
        <span className="text-[10px] text-on-surface/40 uppercase tracking-widest font-label">
          {editor.storage.characterCount?.words?.() ?? 0} palabras
        </span>
      </div>
    </div>
  )
}
