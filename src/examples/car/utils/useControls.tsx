import { RefObject, useContext, useEffect, useRef } from "react";
import { CanvasRes } from "./useCanvasMap";
import { useFrame } from "@react-three/fiber";
import { useDemo } from "../../../App";
import { mapLinear } from "three/src/math/MathUtils";

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
export interface ControlRes {
    left: number;
    right: number;
    auto: boolean;
    commands: {
        queue: Command[];
    };
    sample: boolean;
}
function useKeyboard(
    res: RefObject<ControlRes>,
    idx: RefObject<{ v: number }>
) {
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
                idx.current.v = 0;
            }
            res.current.sample = sample;
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

export function useControls(canvasRef: RefObject<CanvasRes>) {
    const idx = useRef({ v: 0 });
    const ref = useRef<ControlRes>({
        left: 0,
        right: 0,
        auto: false,
        commands: {
            queue: [
                go(canvasRef, () => idx.current.v++, timer(300)),
                trace(canvasRef, () => idx.current.v++, rightIntersection),
                stop(canvasRef, () => idx.current.v++, timer(10)),
                align(canvasRef, () => idx.current.v++, timer(500)),
                drive(canvasRef, () => idx.current.v++, timer(350), -1),
                trace(canvasRef, () => idx.current.v++, rightIntersection),
                drive(canvasRef, () => idx.current.v++, timer(350), -1),
                trace(canvasRef, () => idx.current.v++, rightIntersection),
                fin(canvasRef, () => idx.current.v++, none),
            ],
        },
        sample: false,
    });
    useKeyboard(ref, idx);
    useFrame(() => {
        const { commands, auto, sample } = ref.current;
        if (auto) {
            if (idx.current.v < commands.queue.length) {
                let [left, right] = commands.queue[idx.current.v]().map(
                    (x) =>
                        Math.max(-1, Math.min(1, Math.trunc(x * 100) / 100)) ||
                        0
                );
                ref.current.left = left;
                ref.current.right = right;
            } else {
                ref.current.auto = false;
            }
        }
        if (sample) {
            console.log(canvasRef.current?.luminance);
        }
    });

    return ref;
}

type CommandMaker<P = void> = (
    can: RefObject<CanvasRes>,
    next: () => void,
    nextTrigger: (can: CanvasRes) => boolean,
    param?: P
) => Command;

type Command = () => [number, number];
interface mapLog {
    (x: number, a1: number, a2: number, b1: number, b2: number): number;
}

const quadraticMap: mapLog = (x, a1, a2, b1, b2) => {
    return mapLinear(x, a1, a2, b1, b2);
};

type Trigger = (can?: CanvasRes) => boolean;
const none = () => false;
const rightIntersection: Trigger = (can?: CanvasRes) => {
    if (!can) return false;
    const { top, bot, rgt } = can.luminance.keys();
    return [top, bot, rgt].every((x) => x < 0.45);
};
const go: CommandMaker = (canRef, next, trigger) => {
    return () => {
        if (!canRef.current) return [0, 0];
        const can = canRef.current;
        if (trigger(can)) {
            next();
            return [0, 0];
        }
        return [1, 1];
    };
};
const trace: CommandMaker = (canRef, next, trigger) => {
    return () => {
        if (!canRef.current) return [0, 0];
        const can = canRef.current;
        if (trigger(can)) {
            next();
            return [0, 0];
        }
        let LEFT = 1,
            RIGHT = 1;
        // reduce power of left or right depending of ratio of left sensor to right sensor
        const { lft, rgt } = can.luminance.keys();
        const turnRaw = Math.min(lft, rgt) / Math.max(lft, rgt);
        const turn = quadraticMap(turnRaw, 0, 1, -1, 1);
        if (lft > rgt) {
            RIGHT = turn;
        } else if (rgt > lft) {
            LEFT = turn;
        }
        return [LEFT, RIGHT];
    };
};

// turn the wheels in opposing directions by ratio until left and right sensors reach
// equalibrium
const align: CommandMaker = (canRef, next, trigger) => {
    return () => {
        if (!canRef.current) return [0, 0];
        const can = canRef.current;
        let LEFT = 0,
            RIGHT = 0;
        const { lft, rgt } = can.luminance.keys();
        const turn = Math.max(lft, rgt) - Math.min(lft, rgt);
        LEFT = RIGHT = turn;
        if (lft > rgt) {
            RIGHT = -turn;
        } else if (rgt > lft) {
            LEFT = -turn;
        }
        if (trigger(can) && turn < 0.1) next();
        return [LEFT, RIGHT];
    };
};

type TriggerMaker<T> = (p: T) => Trigger;
const timer: TriggerMaker<number> = (ms: number) => {
    const state = { started: false, time: Infinity };
    return (_?: CanvasRes) => {
        if (!state.started) {
            state.started = true;
            state.time = Date.now() + ms;
        } else if (state.time < Date.now()) {
            return true;
        }
        return false;
    };
};

const stop: CommandMaker = (canRef, next, trigger) => {
    return () => {
        if (!canRef.current) return [0, 0];
        if (trigger(canRef.current)) next();
        return [0, 0];
    };
};

const fin: CommandMaker = (_, next) => {
    return () => {
        next();
        console.log("DONE");
        return [0, 0];
    };
};

const straight: Trigger = (can?: CanvasRes) => {
    if (!can) return false;
    const { top, bot, lft, rgt } = can.luminance.keys();
    const res =
        [top, bot].every((x) => x < 0.1) && [lft, rgt].every((x) => x > 0.9);
    if (res) debugger;
    return res;
};

// drive the wheels with a degree of turning: 0 = straight, -1 = full turn left, 1 = full turn right
type DriveParam = number;
const drive: CommandMaker<DriveParam> = (
    canRef,
    next,
    trigger,
    degrees = 0
) => {
    return () => {
        if (!canRef.current) return [0, 0];
        const can = canRef.current;
        if (trigger(can)) {
            next();
            return [0, 0];
        }
        let LEFT = 1,
            RIGHT = 1;
        // reduce power of left or right depending on degrees turn
        if (degrees < 0) {
            RIGHT = degrees;
        } else if (degrees > 0) {
            LEFT = -degrees;
        }

        return [LEFT, RIGHT];
    };
};
