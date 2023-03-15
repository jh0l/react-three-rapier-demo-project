import { RefObject, useEffect, useRef, useState } from "react";
import { CanvasRes } from "./useCanvasMap";
import { useFrame } from "@react-three/fiber";
import { useDemo } from "../../../App";
import AutoTraceVehicle from "./autoTraceVehicle";

export interface ControlState {
    auto: boolean;
}

type StateArr = [
    ControlState,
    React.Dispatch<React.SetStateAction<ControlState>>
];
export function useControls(canvasRef: RefObject<CanvasRes>) {
    const stateArr = useState({ auto: false });
    const [state, setState] = stateArr;
    const idx = useRef({ v: -1 });
    const ref = useRef<AutoTraceVehicle>(
        new AutoTraceVehicle(canvasRef.current!)
    );
    useKeyboard(ref, idx, stateArr);
    useFrame(() => {
        const { auto } = state;
        if (auto && canvasRef.current) {
            if (!ref.current.run()) setState({ auto: false });
        }
        if (ref.current.state.sample) {
            console.log(canvasRef.current?.luminance);
        }
    });

    return [ref, stateArr] as const;
}

export function useKeyPresses(event: (key: string, b: boolean) => void) {
    useEffect(() => {
        const downHandler = ({ key }: KeyboardEvent) => event(key, true);
        const upHandler = ({ key }: KeyboardEvent) => event(key, false);
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);
}

export type KeyMapType<T> = { [key: string]: T };
const keyMap: KeyMapType<string> = {
    ArrowUp: "forward",
    w: "forward",
    ArrowDown: "backward",
    s: "backward",
    ArrowLeft: "left",
    a: "left",
    ArrowRight: "right",
    d: "right",
    " ": "brake",
    k: "auto",
    j: "sample",
    r: "reset",
    p: "paused",
};

function useKeyboard(
    res: RefObject<AutoTraceVehicle>,
    idx: RefObject<{ v: number }>,
    stateArr: StateArr
) {
    const [, setState] = stateArr;
    const demo = useDemo();
    const keys = useRef<KeyMapType<boolean>>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
        auto: false,
        reset: false,
        paused: false,
        sample: false,
    });
    useKeyPresses((key, b) => {
        if (
            key in keyMap &&
            keyMap[key] in keys.current &&
            res.current &&
            idx.current
        ) {
            keys.current[keyMap[key]] = b;
            const {
                forward,
                backward,
                left,
                right,
                brake,
                auto,
                sample,
                reset,
                paused,
            } = keys.current;
            // power for left and right wheels based on what keys are pressed
            res.current.state.left = 0;
            res.current.state.right = 0;
            if (forward) {
                res.current.state.left += 1;
                res.current.state.right += 1;
            }
            if (backward) {
                res.current.state.left -= 1;
                res.current.state.right -= 1;
            }
            if (left) {
                res.current.state.left -= 1;
                res.current.state.right += 1;
            }
            if (right) {
                res.current.state.left += 1;
                res.current.state.right -= 1;
            }
            if (brake) {
                res.current.state.left = 0;
                res.current.state.right = 0;
            }
            if (auto) {
                setState((s) => ({
                    auto: !s.auto,
                }));
                idx.current.v = -1;
            }
            res.current.state.sample = sample;
            if (reset && demo.resetPhysics && demo.setPaused) {
                console.log("reset");
                demo.resetPhysics();
                demo.setPaused(false);
            }
            if (paused && demo.setPaused) {
                demo.setPaused((x) => !x);
            }
        }
    });
}
