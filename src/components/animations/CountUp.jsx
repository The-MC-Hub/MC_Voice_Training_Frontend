import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function CountUp({
    to,
    from = 0,
    direction = "up",
    delay = 0,
    duration = 2, 
    className = "",
    startWhen = true,
    separator = ",",
    decimals = 0,
    decimal = ".",
    prefix = "",
    suffix = "",
}) {
    const ref = useRef(null);
    const motionValue = useMotionValue(direction === "down" ? to : from);

    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (isInView && startWhen) {
            if (typeof delay === "number" && delay > 0) {
                setTimeout(() => {
                    motionValue.set(direction === "down" ? from : to);
                }, delay * 1000);
            } else {
                motionValue.set(direction === "down" ? from : to);
            }
        }
    }, [isInView, startWhen, motionValue, direction, from, to, delay]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                const options = {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                };

                const formattedNumber = Intl.NumberFormat("en-US", options).format(
                    latest.toFixed(decimals)
                );

                let display = formattedNumber;

                if (separator !== ",") {
                    display = display.replace(/,/g, separator);
                }
                if (decimal !== ".") {
                    display = display.replace(/\./g, decimal);
                }

                ref.current.textContent = `${prefix}${display}${suffix}`;
            }
        });
    }, [springValue, decimals, decimal, separator, prefix, suffix]);

    return <span className={className} ref={ref} />;
}
