'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import '@uiw/react-md-editor/markdown-editor.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  rows = 15,
}: MarkdownEditorProps) {
  const { theme } = useTheme();

  // Calculate height based on rows (assuming ~24px per row)
  const height = rows * 24;

  return (
    <div className="w-full" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview="edit"
        hideToolbar={false}
        enableScroll={true}
        visibleDragbar={false}
        textareaProps={{
          placeholder: placeholder,
        }}
      />
    </div>
  );
}
