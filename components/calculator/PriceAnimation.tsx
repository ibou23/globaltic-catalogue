"use client";

import React from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";

interface PriceAnimationProps {
  value: number;
  className?: string;
}

export function PriceAnimation({ value, className }: PriceAnimationProps) {
  const [displayValue, setDisplayValue] = React.useState(value);

  React.useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value, displayValue]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-SN", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(price)).replace("XOF", "F CFA");
  };

  return (
    <motion.div className={className}>
      {formatPrice(displayValue)}
    </motion.div>
  );
}
