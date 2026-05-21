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
                        <div className="my-6 overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-inner">
                            <table className="w-full border-collapse text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-white/10 text-gold font-black uppercase tracking-wider">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="border-b border-white/10 px-4 py-3 text-left">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="border-b border-white/5 px-4 py-3 text-slate-300 font-medium">{children}</td>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 leading-[1.8] tracking-wide text-slate-200">{children}</p>
                    ),
                    h1: ({ children }) => <h1 className="text-2xl font-black text-gold mb-6 mt-8 uppercase tracking-tighter">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-black text-gold mb-4 mt-6 uppercase tracking-tight">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-gold/90 mb-3 mt-5">{children}</h3>,
                    ul: ({ children }) => <ul className="list-none space-y-2 mb-6 ml-4">{children}</ul>,
                    li: ({ children }) => (
                        <li className="relative pl-6 text-slate-300 before:content-[''] before:absolute before:left-0 before:top-3 before:w-1.5 before:h-1.5 before:bg-gold/60 before:rounded-full">
                            {children}
                        </li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-black text-white decoration-gold/30 underline-offset-4">{children}</strong>
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
