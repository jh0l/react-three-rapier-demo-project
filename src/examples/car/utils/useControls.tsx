import { RefObject, useEffect, useRef } from "react";
import { CanvasRef } from "./useHookmaMap";
import { useFrame } from "@react-three/fiber";
import { getColorName } from "./colors";

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
    commands: {
        queue: CommandsQueue;
        pullup: number;
    };
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
type CommandsQueue = (COMMAND | number)[];
const DEFAULT_COMMANDS: CommandsQueue = [
    "COAST",
    "WAIT",
    "",
    "RIGHT",
    1400,
    "",
    "RIGHT",
    1600,
];
const PULLUP = 6;
type COMMAND = "" | "COAST" | "WAIT" | "STOP" | "RIGHT" | "LEFT" | "STRAIGHT";
export function useControls(canvasRef?: CanvasRef) {
    const ref = useRef<ControlRes>({
        left: 0,
        right: 0,
        auto: false,
        commands: {
            queue: [...DEFAULT_COMMANDS],
            pullup: 0,
        },
        sample: false,
    });
    useKeyboard(ref);
    useFrame(() => {
        if (!ref.current.auto || !canvasRef?.color) return;
        if (ref.current.auto && ref.current.commands.queue.length < 1) {
            ref.current.commands.queue = [...DEFAULT_COMMANDS];
            ref.current.commands.pullup = 0;
        }
        if (
            ref.current.commands.queue.length > 0 &&
            ref.current.commands.queue[0] !== ""
        ) {
            // command currently executing
            if (ref.current.commands.queue[0] === "COAST") {
                ref.current.commands.queue.shift();
                console.log("bing bong");
                const coast = () =>
                    setTimeout(() => {
                        if (ref.current.commands.queue[0] !== "WAIT") return;
                        console.log(ref.current.commands.queue[0]);
                        const colors = canvasRef.color.map((v) =>
                            getColorName(
                                [...v].map((x) => Math.round(x / 255) * 255)
                            )
                        );
                        console.log(...colors);
                        const [top, lft, bot, rgt] = colors;
                        if (
                            top === "black" &&
                            lft === "white" &&
                            bot === "black" &&
                            rgt === "white"
                        ) {
                            // get rid of "WAIT"
                            ref.current.commands.queue.shift();
                        } else {
                            ref.current.left = 1;
                            ref.current.right = 1;
                            coast();
                        }
                    }, 32);
                coast();
            }
            return;
        }
        const colors = canvasRef.color.map((v) =>
            getColorName([...v].map((x) => Math.round(x / 255) * 255))
        );
        const [top, lft, bot, rgt] = colors;
        let left = 0;
        let right = 0;
        if (top === "black" && bot === "black") (left = 1), (right = 1);
        if (lft === "black") (left = 0), (right = 1);
        if (rgt === "black") (left = 1), (right = 0);
        if (bot === "black" && top === "white" && rgt === "white")
            (left = 0), (right = 1);
        if (bot === "black" && top === "white" && lft === "white")
            (left = 1), (right = 0);
        if (
            bot === "black" &&
            top === "white" &&
            lft === "white" &&
            rgt === "white"
        )
            (left = 1), (right = 1);
        // if there's enough black pixels, execute the next command
        if (colors.reduce((acc, c) => acc + Number(c === "black"), 0) > 2) {
            const { commands } = ref.current;
            // make sure all black wasn't a fluke
            if (commands.pullup > 0) return commands.pullup--;
            commands.pullup = PULLUP;
            // remove "" and read next command
            commands.queue.shift();
            const command = commands.queue.shift();
            if (command === "STOP") {
                left = 0;
                right = 0;
            }
            if (command === "RIGHT") {
                left = 1;
                right = -0.44;
            }
            if (command === "LEFT") {
                left = -0.44;
                right = 1;
            }
            // time to wait
            const time = commands.queue[0];
            if (typeof time == "number") {
                setTimeout(() => {
                    commands.queue.shift();
                }, time);
            }
        } else {
            ref.current.commands.pullup = PULLUP;
        }
        ref.current.left = left;
        ref.current.right = right;
    });

    return ref;
}
