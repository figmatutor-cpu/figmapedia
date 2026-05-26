"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetIso: string;
}

interface Parts {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function diffFrom(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  if (ms === 0) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(ms / 1000);
  return {
    done: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function CountdownTimer({ targetIso }: CountdownTimerProps) {
  const target = new Date(targetIso).getTime();
  const [parts, setParts] = useState<Parts>(() => diffFrom(target));

  useEffect(() => {
    setParts(diffFrom(target));
    const interval = setInterval(() => {
      setParts(diffFrom(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (parts.done) {
    return <span className="text-meta text-fg-4">투표 마감</span>;
  }

  if (parts.days > 0) {
    return (
      <span className="text-meta text-fg-2">
        마감까지{" "}
        <strong className="text-fg-1">
          {parts.days}일 {parts.hours}시간
        </strong>
      </span>
    );
  }

  return (
    <span className="text-meta text-fg-2">
      마감까지{" "}
      <strong className="text-fg-1">
        {String(parts.hours).padStart(2, "0")}:
        {String(parts.minutes).padStart(2, "0")}:
        {String(parts.seconds).padStart(2, "0")}
      </strong>
    </span>
  );
}
