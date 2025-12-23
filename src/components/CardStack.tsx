import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import type { Cat } from "../types";
import { useMemo, useState } from "react";

type Props = {
  cats: Cat[];
  onDecision: (cat: Cat, decision: "like" | "dislike") => void;
};

const SWIPE_DISTANCE = 140;

export default function CardStack({ cats, onDecision }: Props) {
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [leaveX, setLeaveX] = useState(0);

  const top = cats[0];
  const next = cats[1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-10, 0, 10]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);

  const bgStyle = useMemo(() => {
    return {
      transform: "scale(0.965) translateY(10px)",
      filter: "brightness(0.92)",
    } as const;
  }, []);

  function decide(decision: "like" | "dislike") {
    if (!top) return;
    setLeavingId(top.id);
    const dir = decision === "like" ? 1 : -1;
    setLeaveX(dir * 900);
    onDecision(top, decision);
  }

  if (!top) return null;

  return (
    <div className="stack">
      {next && (
        <div className="card bg" style={bgStyle}>
          <img src={next.imageUrl} alt="Next cat" draggable={false} />
        </div>
      )}

      <AnimatePresence>
        <motion.div
          key={top.id}
          className="card fg"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          whileDrag={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > SWIPE_DISTANCE) decide("like");
            else if (info.offset.x < -SWIPE_DISTANCE) decide("dislike");
          }}
          animate={{ opacity: 1 }}
          exit={{ x: leavingId === top.id ? leaveX : 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <motion.div className="badge like" style={{ opacity: likeOpacity }}>
            LIKE
          </motion.div>
          <motion.div className="badge nope" style={{ opacity: nopeOpacity }}>
            NOPE
          </motion.div>

          <img src={top.imageUrl} alt="Cat" draggable={false} />

          <div className="hintOverlay">Drag / Swipe</div>

          <div className="actions">
            <button className="btn dislike" onClick={() => decide("dislike")} aria-label="Dislike">
              ✕
            </button>
            <button className="btn like" onClick={() => decide("like")} aria-label="Like">
              ♥
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
