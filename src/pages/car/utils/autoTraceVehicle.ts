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
    probe: {
        X: number;
        Y: number;
    };
    cmds: {
        queue: CommandBarMaker[];
        command: CommandBar;
        idx: number;
    };
    sample: boolean;
    tick: number;
}

export default class AutoTraceVehicle {
    can: CanvasRes;
    state: State;
    cmdArgs = new CommandParam();
    constructor(can: CanvasRes) {
        this.can = can;
        this.state = {
            record: new Array(2000),
            left: 0,
            right: 0,
            probe: {
                X: 0,
                Y: 0,
            },
            cmds: {
                queue: [
                    [go, timer(20)],
                    [trace(0.8), intersection("R")],
                    [stop, timer(5)],
                    [align, timer(10)],
                    [drive([0]), timer(8)],
                    [drive([-1]), timer(20)],
                    [drive([-1, 0.6]), intersection("I")],
                    [trace(), intersection("R")],
                    [stop, timer(3)],
                    [trace(), intersection("T")],
                    [drive([-1, 0.6]), timer(40)],
                    [drive([0, 0.6]), timer(30)],
                    [drive([1, 0.6]), timer(40)],
                    [drive([0, -0.6]), timer(40)],
                    [drive([1, 1]), timer(60)],
                    [drive([1, 0.6]), intersection("I")],
                    [align, timer(15)],
                    [drive([0, 0.8]), timer(10)],
                    [trace(), intersection("L")],
                    [stop, timer(3)],
                    [trace(), intersection("T")],
                    [drive([0, -1]), timer(10)],
                    [drive([-1, -1]), timer(18)],
                    [drive([0.5, 1]), timer(23)],
                    [drive([1, 0.6]), intersection("I")],
                    [align, timer(10)],
                    [trace(), intersection("W")],
                    [drive([0]), timer(38)],
                    [drive([1, 0.7]), timer(120)],
                    [stop, done],
                ],
                idx: -1,
                command: [],
            },
            sample: false,
            tick: 0,
        };
        this.cmdArgs = new CommandParam();
    }
    parseCommandBarMaker(cbm: CommandBarMaker, next: () => void): CommandBar {
        const complete = { current: 0 };
        const nextCount = () => {
            complete.current -= 1;
            if (complete.current <= 0) next();
        };
        const parseCommandBarMakerUnit = (
            cbmu: CommandBarMakerUnit
        ): [CommandMaker[], Trigger] => {
            const [cmdmkr, trigmkr] = cbmu;
            let trig: Trigger = () => false;
            if (trigmkr) {
                trig = trigmkr(nextCount, this.can, this.state);
                complete.current += 1;
            }
            const cmds: CommandMaker[] = [];
            if (typeof cmdmkr === "function") {
                cmds.push(cmdmkr);
            } else {
                for (const cmd of cmdmkr) {
                    cmds.push(cmd);
                }
            }
            return [cmds, trig];
        };
        const res: CommandBar = [];
        if (typeof cbm[0] === "function") {
            cbm = cbm as CommandBarMakerUnit;
            res.push(parseCommandBarMakerUnit(cbm));
        } else if (typeof cbm[0][0] === "function") {
            cbm = cbm as CommandBarMakerUnit[];
            for (const cbmu of cbm) {
                res.push(parseCommandBarMakerUnit(cbmu));
            }
        }
        return res;
    }

    nextCommand() {
        const { cmds } = this.state;
        cmds.command = this.parseCommandBarMaker(cmds.queue[cmds.idx]);
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
            cmds.command(this.cmdArgs);
            [this.state.left, this.state.right] = this.cmdArgs._drive;
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
        this.state.record = new Array(2000);
        this.state.tick = 0;
        this.cmdArgs = new CommandParam();
    }

    applyControlValues({
        x,
        y,
        active,
    }: {
        x: number;
        y: number;
        active: boolean;
    }) {
        // x is left/right
        // y is forward/backward
        if (active) {
            let lft = -y + x;
            let rgt = -y - x;
            [this.state.left, this.state.right] = this.cmdArgs.drive(
                lft,
                rgt
            )._drive;
        }
    }
}

class CommandParam {
    _drive: [number, number];
    _probe: [number, number];
    constructor() {
        this._drive = [0, 0];
        this._probe = [0, 0];
    }
    drive(left?: number, right?: number) {
        if (left !== undefined) this._drive[0] = this.clean(left);
        if (right !== undefined) this._drive[1] = this.clean(right);
        return this;
    }
    probe(x?: number, y?: number) {
        if (x !== undefined) this._probe[0] = x;
        if (y !== undefined) this._probe[1] = y;
        return this;
    }
    clean(x: number): number {
        return Math.max(-1, Math.min(1, Math.trunc(x * 100) / 100)) || 0;
    }
}

// A CommandBar is made from a CommandBarMaker by calling each CommandMaker with the TriggerMaker it is paired with (or a placeholder if there is no TriggerMaker) in each of the CommandBarMakerUnits of the CommandBarMaker
// Through the CommandBar, commands can run concurrently, much like instruments in a song
// For each bar, commands are run in unison until their trigger is met. Once all commands in the array have triggers met, the queue index is incremented and the we move on to the next CommandBar.
// If a command has no trigger, it will run until the bar is ended by another command's trigger

type Trigger = () => boolean;
type TriggerMaker = (next: () => void, can: CanvasRes, ref: State) => Trigger;
type TriggerMakerMaker<T> = (p: T) => TriggerMaker;

type Command = (args: CommandParam) => CommandParam;

type CommandMaker = (trigger: Trigger, can: CanvasRes, ref: State) => Command;

type CommandMakerMaker<P> = (p: P) => CommandMaker;

type CommandBar = [CommandMaker[], Trigger][];

type CommandBarMakerUnit = [CommandMaker | CommandMaker[], TriggerMaker?];
type CommandBarMaker = CommandBarMakerUnit | CommandBarMakerUnit[];

const blank: Command = (p) => p.drive(0, 0);

const done: TriggerMaker = (next) => () => {
    next();
    return true;
};

//const none: TriggerMaker = () => () => false;

const intersection: TriggerMakerMaker<"R" | "L" | "T" | "I" | "W"> =
    (lock) => (next, can: CanvasRes) => {
        return function intersection() {
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
                    : lock === "W"
                    ? [[], [top, bot, rgt, lft]]
                    : [[], []];
            const res =
                dark.every((x) => x < 0.4) && light.every((x) => x > 0.8);
            if (res) {
                next();
                return true;
            }
            return false;
        };
    };

const go: CommandMaker = (trigger) => {
    return function go(args) {
        if (trigger()) {
            return args.drive(0, 0);
        }
        return args.drive(1, 1);
    };
};

// There is a path that is made up of a black line with a white line on either side. These three lines are even thickness.
// trace returns function that runs every 16ms keeping the robot in the centre of the black line surrounded by two white lines all lines are equal thickness by measuring the brightness of the left and right sensors and the augmented ratio of the darker sensor (lower value) against the lighter sensor (higher value).
// can is onject that contains brightness values for left and right side sensors
// trigger is a function that returns true when the command shouldn't be run by the vehicle anymore.
const trace: CommandMakerMaker<number | void> =
    (speed = 1) =>
    (trigger, can) => {
        return function trace(args) {
            speed = speed || 1;
            if (trigger()) {
                return args.drive(0, 0);
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
            return args.drive(LEFT * speed, RIGHT * speed);
        };
    };

// turn the wheels in opposing directions by ratio until left and right sensors reach
// equalibrium
const align: CommandMaker = (trigger, can) => {
    return function align(args) {
        let LEFT = 0,
            RIGHT = 0;
        const { lft, rgt } = can.luminance.keys();
        const turn = Math.max(lft, rgt) - Math.min(lft, rgt);
        LEFT = RIGHT = Math.max(turn, 0.1);
        if (lft > rgt) {
            RIGHT = -turn;
        } else if (rgt > lft) {
            LEFT = -turn;
        }
        if (turn < 0.42) trigger();
        return args.drive(LEFT, RIGHT);
    };
};
// ms per frame TODO: get better ticks
const timer: TriggerMakerMaker<number> = (ticks) => {
    return function timer(next, _, refState) {
        const state = { started: false, time: 0 };
        return () => {
            const { tick } = refState;
            if (!state.started) {
                state.started = true;
                state.time = tick + ticks;
            } else if (state.time < tick) {
                next();
                return true;
            }
            return false;
        };
    };
};

const stop: CommandMaker = (trigger) => {
    return function stop(args) {
        trigger();
        return args.drive(0, 0);
    };
};

// drive the wheels with a degree of turning: 0 = straight, -1 = full turn left, 1 = full turn right
type DriveParam = [number] | [number, number];
const drive: CommandMakerMaker<DriveParam> =
    ([deg, pow = 1]) =>
    (trigger) => {
        return function drive(args) {
            if (trigger()) {
                return args.drive(0, 0);
            }
            let LEFT = 1,
                RIGHT = 1;
            // as abs(degrees) approaches 0.5, one wheels slows until stopped, as from 0.5 to 1, this wheel starts spinning in the opposite direction until it is full speed in the opposite direction to the other wheel.
            if (deg < 0) {
                RIGHT = 1 - Math.abs(deg) * 2;
            } else if (deg > 0) {
                LEFT = 1 - Math.abs(deg) * 2;
            }

            return args.drive(LEFT * pow, RIGHT * pow);
        };
    };
