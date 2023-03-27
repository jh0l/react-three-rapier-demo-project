    import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import cn from "clsx";
import { mapLinear } from "three/src/math/MathUtils";
import s from "./onScreenControls.module.css";

export const CONTROL_VALUES = {
    x: 0,
    y: 0,
    active: false,
};
let interval = 0;

export default function OnScreenControls() {
    const constraintsRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);
    const [values, setValues] = useState([0, 0]);
    const [active, _setActive] = useState(false);
    const updateControlValues = () => {
        if (!constraintsRef.current || !controlRef.current) return;
        const { x, y, height, width } =
            constraintsRef.current.getBoundingClientRect();
        const cont = controlRef.current.getBoundingClientRect();
        const [cx, cy] = [cont.x + cont.width / 2, cont.y + cont.height / 2];
        CONTROL_VALUES.x = mapLinear(cx, x, x + width, -1, 1) * 2;
        CONTROL_VALUES.y = mapLinear(cy, y, y + height, -1, 1) * 2;
    };
    const setActive = (val: boolean) => {
        _setActive(() => {
            CONTROL_VALUES.active = val;
            return val;
        });
    };
    useEffect(() => {
        interval = setInterval(() => {
            setValues([CONTROL_VALUES.x, CONTROL_VALUES.y]);
            updateControlValues();
        }, 300);
        return () => clearInterval(interval);
    }, []);
    return (
        <div className={s.dragAreaParent}>
            <motion.div ref={constraintsRef} className={s.dragArea} />
            <motion.div
                onClick={() => setActive(true)}
                className={cn(s.dragAreaContainer, !active && "opacity-10")}
                drag
                dragConstraints={constraintsRef}
                dragElastic={0}
                dragSnapToOrigin={true}
                onDrag={updateControlValues}
                ref={controlRef}
            >
                <pre>
                    {active ? (
                        <>
                            x:{values[0].toFixed(2)}
                            <br />
                            y:{values[1].toFixed(2)}
                        </>
                    ) : (
                        "Touch to control"
                    )}
                </pre>
            </motion.div>
            {active && (
                <button
                    className={s.disableBtn}
                    onClick={() => setActive(false)}
                >
                    <pre>disable</pre>
                </button>
            )}
        </div>
    );
}
