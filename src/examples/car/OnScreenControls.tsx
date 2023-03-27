import {motion} from "framer-motion"
import { useRef } from "react";

const dragArea = {opacity: 0.2;
  background: white;
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 30px;
  top: calc(50% - 150px);
  left: calc(50% - 150px);}

export default function OnScreenControls() {
  const constraintsRef = useRef(null);

  return (
    <>
      <motion.div style={dragArea} ref={constraintsRef} />
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.25}
        dragSnapToOrigin={true}
      />
    </>
  );
}