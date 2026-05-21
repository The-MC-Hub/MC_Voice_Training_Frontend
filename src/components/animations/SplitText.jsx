import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SplitText = ({
    text = "",
    className = "",
    delay = 0.05,
    initial = { opacity: 0, y: 20 },
    animate = { opacity: 1, y: 0 },
    transition = { type: "spring", damping: 12, stiffness: 200 },
}) => {
    const letters = Array.from(text);
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: delay, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            ...animate,
            transition: {
                ...transition,
            },
        },
        hidden: {
            ...initial,
            transition: {
                ...transition,
            },
        },
    };

    return (
        <motion.p
            style={{ display: "inline-flex", flexWrap: "wrap" }}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={className}
        >
            {letters.map((letter, index) => (
                <motion.span
                    variants={child}
                    key={index}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                    {letter}
                </motion.span>
            ))}
        </motion.p>
    );
};

export default SplitText;
