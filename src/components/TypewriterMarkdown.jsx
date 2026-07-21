import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

const TypewriterMarkdown = ({ content, speed = 2, enabled = true }) => {
    const [displayedContent, setDisplayedContent] = useState(enabled ? "" : content);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setDisplayedContent(content);
            return;
        }
        setDisplayedContent("");
        setIndex(0);
    }, [content, enabled]);

    useEffect(() => {
        if (!enabled) return;
        if (index < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedContent((prev) => prev + content[index]);
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, content, speed]);

    return (
        <div className="relative">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    table: ({ children }) => (
                        <div className="my-4 overflow-hidden rounded-md border border-white/[0.12] bg-[#111113]">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-[#f5a623]/[0.08]">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-white/[0.08] px-4 py-2.5 text-left text-[11px] font-bold text-[#f5a623] uppercase tracking-wider">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-white/[0.05] px-4 py-2.5 text-[13px] text-zinc-200 font-medium last:border-0">{children}</td>
                    ),
                    p: ({ children }) => (
                        <p className="mb-3 leading-[1.75] text-[13px] text-zinc-200">{children}</p>
                    ),
                    h1: ({ children }) => <h1 className="text-[17px] font-bold text-white mb-4 mt-6">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-[15px] font-bold text-[#f5a623] mb-3 mt-5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-[13px] font-semibold text-zinc-100 mb-2 mt-4">{children}</h3>,
                    ul: ({ children }) => <ul className="list-none space-y-1.5 mb-4 ml-1">{children}</ul>,
                    li: ({ children }) => (
                        <li className="relative pl-5 text-[13px] text-zinc-300 leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:bg-[#f5a623]/50 before:rounded-full">
                            {children}
                        </li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                    ),
                }}
            >
                {displayedContent}
            </ReactMarkdown>
            {index < content.length && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-2 h-5 bg-gold ml-1 align-middle"
                />
            )}
        </div>
    );
};

export default TypewriterMarkdown;
