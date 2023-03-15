import { mapLinear } from "three/src/math/MathUtils";
import { CanvasRes } from "./useCanvasMap";

interface ControlFrame {
    raw: {
        left: number;
        right: number;
    };
    left: number;
    right: number;
}

interface State {
    autoRecord: ControlFrame[];
    left: number;
    right: number;
    cmds: {
        queue: [CommandMaker, TriggerMaker][];
        command: Command;
        idx: number;
    };
    sample: boolean;
}

export default class AutoTraceVehicle {
    can: CanvasRes;
    state: State;
    constructor(can: CanvasRes) {
        this.can = can;
        this.state = {
            autoRecord: new Array(2000),
            left: 0,
            right: 0,
            cmds: {
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
                command: blank,
                idx: -1,
            },
            sample: false,
        };
    }
    nextCommand() {
        const { cmds } = this.state;
        cmds.command = cmds.queue[cmds.idx][0](
            cmds.queue[cmds.idx][1](this.can, () => this.nextCommand()),
            this.can
        );
        cmds.idx += 1;
    }

    // runs the command
    // returns true if there are more commands to run
    // returns false if there are no more commands to run
    run() {
        const { cmds } = this.state;
        if (cmds.idx < 0 && cmds.queue.length) {
            // get first command ready
            cmds.idx = 0;
            this.nextCommand();
        }
        if (cmds.idx < cmds.queue.length) {
            // run current command and apply (cleaned) output
            const [left, right] = cmds.command().map(AutoTraceVehicle.cleanOut);
            this.state.left = left;
            this.state.right = right;
            this.state.autoRecord.push({
                raw: { left, right },
                left,
                right,
            });
        } else {
            // reset
            cmds.idx = -1;
            cmds.command = blank;
            this.state.autoRecord = new Array(2000);
            return false;
        }
        return true;
    }

    static cleanOut(x: number): number {
        return Math.max(-1, Math.min(1, Math.trunc(x * 100) / 100)) || 0;
    }
}

type CommandMakerMaker<P> = (p: P) => CommandMaker;

type CommandMaker = (nextTrigger: () => boolean, can: CanvasRes) => Command;

type Command = () => [number, number];
interface mapLog {
    (x: number, a1: number, a2: number, b1: number, b2: number): number;
}

const blank: Command = () => [0, 0];

const quadraticMap: mapLog = (x, a1, a2, b1, b2) => {
    return mapLinear(x, a1, a2, b1, b2);
};

type Trigger = () => boolean;
type TriggerMaker = (can: CanvasRes, next: () => void) => Trigger;
type TriggerMakerMaker<T> = (p: T) => TriggerMaker;

const none: TriggerMaker = () => () => false;

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

const trace: CommandMaker = (trigger, can) => {
    return () => {
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
const align: CommandMaker = (trigger, can) => {
    return () => {
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
        if (turn < 0.15) trigger();
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
const drive: CommandMakerMaker<DriveParam> = (degrees) => (trigger) => {
    return () => {
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
