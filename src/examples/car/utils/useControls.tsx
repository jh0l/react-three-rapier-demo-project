import { RefObject, useEffect, useRef } from "react";
import { CanvasRes } from "./useCanvasMap";
import { useFrame } from "@react-three/fiber";
import { useDemo } from "../../../App";
import { mapLinear } from "three/src/math/MathUtils";
export interface ControlRes {
    left: number;
    right: number;
    auto: boolean;
    commands: {
        queue: [CommandMaker, TriggerMaker][];
        command: Command;
    };
    sample: boolean;
}

export function useControls(canvasRef: RefObject<CanvasRes>) {
    const idx = useRef({ v: -1 });
    const ref = useRef<ControlRes>({
        left: 0,
        right: 0,
        auto: false,
        commands: {
            queue: [
                [go, timer(300)],
                [trace, intersection("R")],
                [stop, timer(10)],
                [align, timer(500)],
                [drive(-1), timer(350)],
                [trace, intersection("R")],
                [stop, timer(10)],
                [trace, intersection("T")],
                [drive(1), timer(800)],
                [align, timer(500)],
                [drive(0), timer(100)],
                [trace, intersection("L")],
                [stop, timer(10)],
                [trace, intersection("T")],
                [stop, timer(10)],
                [align, timer(500)],
                [drive(1), timer(350)],
                [trace, timer(2100)],
                [drive(1), timer(790)],
                [fin, none],
            ],
            command: () => [0, 0],
        },
        sample: false,
    });
    useKeyboard(ref, idx);
    function nextFn() {
        if (!canvasRef.current) return;
        ref.current.commands.command = ref.current.commands.queue[
            idx.current.v
        ][0](
            ref.current.commands.queue[idx.current.v][1](
                canvasRef.current,
                nextFn
            ),
            canvasRef
        );
        idx.current.v += 1;
    }
    useFrame(() => {
        const { commands, auto, sample } = ref.current;
        if (auto && canvasRef.current) {
            if (idx.current.v < 0 && commands.queue.length) {
                idx.current.v = 0;
                nextFn();
            }
            if (idx.current.v < commands.queue.length) {
                const output = commands.command();
                for (let i = 0, x; i < output.length; i++) {
                    x = output[i];
                    x = Math.max(-1, Math.min(1, Math.trunc(x * 100) / 100));
                    output[i] = x || 0;
                }
                ref.current.left = output[0];
                ref.current.right = output[1];
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
                idx.current.v = -1;
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

type CommandMakerMaker<P> = (p: P) => CommandMaker;

type CommandMaker = (
    nextTrigger: () => boolean,
    can: RefObject<CanvasRes>
) => Command;

type Command = () => [number, number];
interface mapLog {
    (x: number, a1: number, a2: number, b1: number, b2: number): number;
}

const quadraticMap: mapLog = (x, a1, a2, b1, b2) => {
    return mapLinear(x, a1, a2, b1, b2);
};

type Trigger = () => boolean;
type TriggerMaker = (can: CanvasRes, next: () => void) => Trigger;
type TriggerMakerMaker<T> = (p: T) => TriggerMaker;

const none: TriggerMaker = () => () => false;

// TODO use TriggerMaker to customize intersection to use different intersection types
const intersection: TriggerMakerMaker<"R" | "L" | "T"> =
    (lock) => (can: CanvasRes, next) => {
        return () => {
            if (!can) return false;
            const { top, bot, rgt, lft } = can.luminance.keys();
            const arr =
                lock === "R"
                    ? [rgt, top, bot]
                    : lock === "L"
                    ? [lft, top, bot]
                    : [bot, rgt, lft];
            const res = arr.every((x) => x < 0.45);
            if (res) {
                next();
                return true;
            }
            return false;
        };
    };

const go: CommandMaker = (trigger) => {
    return () => {
        if (trigger()) {
            return [0, 0];
        }
        return [1, 1];
    };
};

const trace: CommandMaker = (trigger, canRef) => {
    return () => {
        if (!canRef.current) return [0, 0];
        const can = canRef.current;
        if (trigger()) {
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
const align: CommandMaker = (trigger, canRef) => {
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
        if (turn < 0.1) trigger();
        return [LEFT, RIGHT];
    };
};

const timer: TriggerMakerMaker<number> = (ms) => {
    return (_, next) => {
        const state = { started: false, time: Infinity };
        return () => {
            if (!state.started) {
                state.started = true;
                state.time = Date.now() + ms;
            } else if (state.time < Date.now()) {
                next();
                return true;
            }
            return false;
        };
    };
};

const stop: CommandMaker = (trigger) => {
    return () => {
        trigger();
        return [0, 0];
    };
};

const fin: CommandMaker = (trigger) => {
    return () => {
        trigger();
        console.log("DONE");
        return [0, 0];
    };
};

// const aligned: Trigger = (can?: CanvasRes) => {
//     if (!can) return false;
//     const { top, bot, lft, rgt } = can.luminance.keys();
//     const res =
//         [top, bot].every((x) => x < 0.1) && [lft, rgt].every((x) => x > 0.9);
//     if (res) debugger;
//     return res;
// };

// drive the wheels with a degree of turning: 0 = straight, -1 = full turn left, 1 = full turn right
type DriveParam = number;
const drive: CommandMakerMaker<DriveParam> = (degrees) => (trigger, canRef) => {
    return () => {
        if (!canRef.current) return [0, 0];
        if (trigger()) {
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
