import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import useEventSubscriber from "../../service/EventManager";
import "./tournament.css";
const TournamentItem: React.FC = () => {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true });
  const { createEvent } = useEventSubscriber(["playGame"], ["game"]);

  useEffect(() => {
    if (isInView) {
      console.log("inView");
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.7 } });
    }
  }, [isInView]);
  return (
    <motion.div
      ref={ref}
      initial={{ y: 80 }}
      animate={controls}
      className="tournament-item"
      style={{
        opacity: 0,
        // transition: "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s",
      }}
      onClick={() => createEvent({ name: "playGame", topic: "game", delay: 10 })}
    >
      <span style={{ fontSize: "20px", color: "black" }}>Tournament</span>
      <div className="play-btn" onClick={() => console.log("play clicked")}>
        Play
      </div>
    </motion.div>
  );
};

export default TournamentItem;
