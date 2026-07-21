import { motion } from "framer-motion";

const ShinyText = ({ text, disabled = false, speed = 5, className = "" }) => {
    const animationProps = !disabled
        ? {
            animate: {
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            },
            transition: {
                duration: speed,
                repeat: Infinity,
                ease: "linear",
            },
        }
        : {};

    return (
        <motion.span
            {...animationProps}
            className={`shiny-text ${className}`}
            style={{
                color: "rgba(255,255,255,0.8)",
                display: "inline-block",
            }}
        >
            {text}
        </motion.span>
    );
};

export default ShinyText;
