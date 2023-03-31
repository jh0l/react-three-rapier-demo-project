import { RefObject, useEffect, useRef, useState } from "react";
import { CanvasRes } from "./useCanvasMap";
import { useFrame } from "@react-three/fiber";
import { useAppContext } from "../../../App";
import AutoTraceVehicle from "./autoTraceVehicle";
import { CONTROL_VALUES } from "../components/OnScreenControls/OnScreenControls";

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
    const ref = useRef<AutoTraceVehicle>(
        new AutoTraceVehicle(canvasRef.current!)
    );
    const { paused } = useAppContext();
    console.log(paused);

    useKeyboard(ref, stateArr);
    useFrame(() => {
        const { auto } = state;
        if (!paused && auto && canvasRef.current) {
            if (!ref.current.run()) setState({ auto: false });
        }
        if (ref.current.state.sample) {
            console.log(canvasRef.current?.luminance);
        }
        // apply onscreencontrol values
        ref.current.applyControlValues(CONTROL_VALUES);
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
    o: "probe_up",
    l: "probe_down",
};

function useKeyboard(ctrl: RefObject<AutoTraceVehicle>, stateArr: StateArr) {
    const [, setState] = stateArr;
    const demo = useAppContext();
    const keys = useRef<KeyMapType<boolean>>(
        Object.values(keyMap).reduce(
            (a, b) => ({ ...a, [b]: false }),
            {} as any
        )
    );
    useKeyPresses((key, b) => {
        if (key in keyMap && keyMap[key] in keys.current && ctrl.current) {
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
                probe_up,
                probe_down,
            } = keys.current;
            // power for left and right wheels based on what keys are pressed
            ctrl.current.state.left = 0;
            ctrl.current.state.right = 0;
            if (forward) {
                ctrl.current.state.left += 1;
                ctrl.current.state.right += 1;
            }
            if (backward) {
                ctrl.current.state.left -= 1;
                ctrl.current.state.right -= 1;
            }
            if (left) {
                ctrl.current.state.left -= 1;
                ctrl.current.state.right += 1;
            }
            if (right) {
                ctrl.current.state.left += 1;
                ctrl.current.state.right -= 1;
            }
            if (brake) {
                ctrl.current.state.left = 0;
                ctrl.current.state.right = 0;
            }
            if (auto) {
                setState((s) => ({
                    auto: !s.auto,
                }));
                ctrl.current.reset();
            }

            if (probe_up) {
                ctrl.current.state.probe.Y += 1;
            }

            if (probe_down) {
                ctrl.current.state.probe.Y -= 1;
            }

            if (reset && demo.resetPhysics && demo.setPaused) {
                console.log("reset");
                demo.resetPhysics();
                demo.setPaused(false);
            }

            if (paused && demo.setPaused) {
                demo.setPaused((x) => !x);
            }

            ctrl.current.state.sample = sample;
        }
    });
}
