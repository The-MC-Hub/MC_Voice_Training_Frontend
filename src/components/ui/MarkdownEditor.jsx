import React, { useState } from "react";
import { Bold, Italic, Heading, List, Link, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownEditor = ({ value, onChange, placeholder, minHeight = "min-h-[120px]", label }) => {
  const [preview, setPreview] = useState(false);
  const textRef = React.useRef(null);

  const insertMarkdown = (before, after = "") => {
    const textarea = textRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);
    onChange({ target: { value: newText } });
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  const tools = [
    { icon: Bold,   action: () => insertMarkdown("**", "**"),     title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*"),       title: "Italic" },
    { icon: Heading,action: () => insertMarkdown("## "),          title: "Heading" },
    { icon: List,   action: () => insertMarkdown("- "),           title: "List" },
    { icon: Link,   action: () => insertMarkdown("[", "](url)"),  title: "Link" },
  ];

  return (
    <div className="space-y-1.5">
      {label && <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</label>}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden focus-within:border-amber-400 transition-colors">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => (
              <button
                key={tool.title}
                type="button"
                onClick={tool.action}
                title={tool.title}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
              >
                <tool.icon size={13} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors ${
              preview ? "bg-amber-100 text-amber-700" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {preview ? <EyeOff size={12} /> : <Eye size={12} />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>

        {/* Editor / Preview */}
        {preview ? (
          <div className={`w-full ${minHeight} p-3 text-[13px] text-gray-700 prose prose-xs max-w-none overflow-y-auto`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "*No content yet.*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => onChange(e)}
            placeholder={placeholder}
            className={`w-full ${minHeight} p-3 text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none resize-y`}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
