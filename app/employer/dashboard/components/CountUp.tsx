"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{display}</>;
}

export default function CountUp({ value }: { value: number | string }) {
  if (typeof value !== "number") return <>{value}</>;
  return <AnimatedNumber value={value} />;
}
