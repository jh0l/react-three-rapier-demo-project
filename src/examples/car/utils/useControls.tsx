import { RefObject, useEffect, useRef } from "react";
import { CanvasRef } from "./useHookmaMap";
import { useFrame } from "@react-three/fiber";

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
};
export interface ControlRes {
    left: number;
    right: number;
    auto: boolean;
    sample: boolean;
}
function useKeyboard(res: RefObject<ControlRes>) {
    const keys = useRef<KeyMapType<boolean>>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
        auto: false,
        sample: false,
    });
    useKeyPresses((key, b) => {
        if (key in keyMap && keyMap[key] in keys.current && res.current) {
            keys.current[keyMap[key]] = b;
            const { forward, backward, left, right, brake, auto, sample } =
                keys.current;
            // figure out power for left and right wheels based on what keys are pressed
            res.current.left = 0;
            res.current.right = 0;
            if (forward) {
                res.current.left += 1;
                res.current.right += 1;
            }
            if (backward) {
                res.current.left -= 1;
                res.current.right -= 1;
            }
            if (left) {
                res.current.left -= 1;
                res.current.right += 1;
            }
            if (right) {
                res.current.left += 1;
                res.current.right -= 1;
            }
            if (brake) {
                res.current.left = 0;
                res.current.right = 0;
            }
            if (auto) {
                res.current.auto = !res.current.auto;
            }
            res.current.sample = sample;
        }
    });
}
const THRESHOLD = 50;
export function useControls(interRef?: CanvasRef) {
    const res = useRef<ControlRes>({
        left: 0,
        right: 0,
        auto: false,
        sample: false,
    });
    useKeyboard(res);
    useFrame(() => {
        if (!res.current.auto || !interRef?.color) return;
        // use color to control car - black means turn right, white means turn left
        // const [r, g, b] = interRef.color;
        // const reflect = ((r + g + b) / 3 / 255) * 100;
        // const deviation = (reflect - THRESHOLD) / 100;
        // const turn = deviation * PROPORTIONAL_GAIN;
        // console.log(turn);
        // res.current.left = -turn + 1;
        // res.current.right = turn + 1;
        // console.log(res.current);
    });

    return res;
}
const PROPORTIONAL_GAIN = 1.6;
