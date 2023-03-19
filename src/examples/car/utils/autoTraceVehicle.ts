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
    record: ControlFrame[];
    left: number;
    right: number;
    cmds: {
        queue: [CommandMaker, TriggerMaker][];
        command: Command;
        idx: number;
    };
    sample: boolean;
    tick: number;
}

export default class AutoTraceVehicle {
    can: CanvasRes;
    state: State;
    constructor(can: CanvasRes) {
        this.can = can;
        this.state = {
            record: new Array(2000),
            left: 0,
            right: 0,
            cmds: {
                queue: [
                    [go, timer(300)],
                    [trace, intersection("R")],
                    [stop, timer(10)],
                    [align, timer(500)],
                    [drive(-1), timer(380)],
                    [trace, intersection("R")],
                    [stop, timer(10)],
                    [trace, intersection("T")],
                    [drive(1), timer(800)],
                    [drive(1), intersection("I")],
                    [align, timer(500)],
                    [drive(0), timer(100)],
                    [trace, intersection("L")],
                    [stop, timer(10)],
                    [trace, intersection("T")],
                    [stop, timer(10)],
                    [align, timer(500)],
                    [drive(1), timer(350)],
                    [trace, timer(2300)],
                    [drive(1), timer(1120)],
                    [stop, done],
                ],
                command: blank,
                idx: -1,
            },
            sample: false,
            tick: 0,
        };
    }
    nextCommand() {
        const { cmds } = this.state;
        cmds.command = cmds.queue[cmds.idx][0](
            cmds.queue[cmds.idx][1](
                () => this.nextCommand(),
                this.can,
                this.state
            ),
            this.can,
            this.state
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
            const rawOutput = cmds.command();
            const [left, right] = this.processSteering(rawOutput);
            this.state.left = left;
            this.state.right = right;
            this.state.tick += 1;
        } else {
            // reset
            this.reset();
            return false;
        }
        return true;
    }
    reset() {
        const { cmds } = this.state;
        cmds.idx = -1;
        cmds.command = blank;
        this.state.record = new Array(2000);
        this.state.tick = 0;
    }

    processSteering([left, right]: [number, number]) {
        left = AutoTraceVehicle.cleanOut(left);
        right = AutoTraceVehicle.cleanOut(right);
        return [left, right];
    }

    static cleanOut(x: number): number {
        return Math.max(-1, Math.min(1, Math.trunc(x * 100) / 100)) || 0;
    }
}

type CommandMakerMaker<P> = (p: P) => CommandMaker;

type CommandMaker = (
    nextTrigger: Trigger,
    can: CanvasRes,
    ref: State
) => Command;

type Command = () => [number, number];

const blank: Command = () => [0, 0];

type Trigger = () => boolean;
type TriggerMaker = (next: () => void, can: CanvasRes, ref: State) => Trigger;
type TriggerMakerMaker<T> = (p: T) => TriggerMaker;

const done: TriggerMaker = (next) => () => {
    next();
    return true;
};

//const none: TriggerMaker = () => () => false;

const intersection: TriggerMakerMaker<"R" | "L" | "T" | "I"> =
    (lock) => (next, can: CanvasRes) => {
        return () => {
            const { top, bot, rgt, lft } = can.luminance.keys();
            const [dark, light] =
                lock === "R"
                    ? [[rgt, top, bot], []]
                    : lock === "L"
                    ? [[lft, top, bot], []]
                    : lock === "T"
                    ? [[bot, rgt, lft], []]
                    : lock === "I"
                    ? [
                          [top, bot],
                          [lft, rgt],
                      ]
                    : [[], []];
            const res =
                dark.every((x) => x < 0.45) && light.every((x) => x > 0.75);
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

// There is a path that is made up of a black line with a white line on either side. These three lines are even thickness.
// trace returns function that runs every 16ms keeping the robot in the centre of the black line surrounded by two white lines all lines are equal thickness by measuring the brightness of the left and right sensors and the augmented ratio of the darker sensor (lower value) against the lighter sensor (higher value).
// can is onject that contains brightness values for left and right side sensors
// trigger is a function that returns true when the command shouldn't be run by the vehicle anymore.
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
        // b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 )
        // experiment with range of -1.5 to 1
        const turn = mapLinear(turnRaw, 0, 1, -1, 1);
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
        if (turn < 0.2) trigger();
        return [LEFT, RIGHT];
    };
};
// ms per frame TODO: get better ticks
const MPF = 60 / 1000;
const timer: TriggerMakerMaker<number> = (ms) => {
    return (next, _, refState) => {
        const state = { started: false, time: 0 };
        return () => {
            const { tick } = refState;
            console.log(tick);
            if (!state.started) {
                state.started = true;
                state.time = tick + ms / MPF;
                console.log(state.time, ms / MPF);
            } else if (state.time < tick) {
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
