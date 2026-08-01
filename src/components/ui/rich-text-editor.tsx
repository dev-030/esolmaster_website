"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import react-quill to avoid SSR hydration issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
  ];

  return (
    <div className={`rich-text-editor bg-white rounded-md border border-slate-200 ${className}`}>
      <style dangerouslySetInnerHTML={{__html: `
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          padding: 8px !important;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
        }
        .ql-container.ql-snow {
          border: none !important;
          border-bottom-left-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .ql-editor {
          min-height: 100px;
          font-family: inherit;
          font-size: 14px;
        }
        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #94a3b8;
        }
        .ql-snow .ql-picker-options {
          border-radius: 6px;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          padding: 4px 0 !important;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
          font-size: 18px !important;
          font-weight: 600;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
          font-size: 16px !important;
          font-weight: 600;
        }
        .ql-snow .ql-picker-item {
          padding: 4px 12px !important;
        }
        .ql-snow .ql-picker-item:hover {
          background-color: #f1f5f9;
        }
      `}} />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
