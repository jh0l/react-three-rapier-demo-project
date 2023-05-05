import {
    CommandParam,
    State,
    CanvasRes,
    FUELSTATION_TEST,
    CommandBarMakerUnit,
    CommandMaker,
    Trigger,
    CommandBar,
    blank,
} from "../../../lib/commandlib";

export default class AutoTraceVehicle {
    can: CanvasRes;
    state: State;
    cmds = new CommandParam();
    constructor(can: CanvasRes) {
        this.can = can;
        this.state = {
            record: new Array(2000),
            cmds: {
                queue: FUELSTATION_TEST,
                idx: -1,
                commands: [],
                processed: [],
                assignNext: false,
            },
            sample: false,
            tick: 0,
        };
        this.cmds = new CommandParam();
    }
    setCommandQueue(queue: (CommandBarMakerUnit | null)[]) {
        this.state.cmds.queue = queue.filter(
            (x) => x !== null
        ) as CommandBarMakerUnit[];
    }
    assignNextCommandBar() {
        const { cmds } = this.state;
        let cbm = cmds.queue[cmds.idx];
        // we want to use the idx before incrementing it so we dont skip things
        cmds.idx += 1;
        const complete: boolean[] = [];
        const nextCount = (trigId: number) => () => {
            complete[trigId] = true;
            // defer calling assignNextCommandBar until all triggers have been called
            if (!complete.includes(false)) cmds.assignNext = true;
        };
        let trigId = 0;
        const parseCommandBarMakerUnit = (
            cbmu: CommandBarMakerUnit
        ): [CommandMaker[], Trigger] => {
            const [cmdmkr, trigmkr] = cbmu;
            let trig: Trigger = () => false;
            if (trigmkr) {
                trig = trigmkr(nextCount(trigId), this.can, this.state);
                complete[trigId] = false;
                trigId += 1;
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
        if (cbm.length === 2 && typeof cbm[1] === "function") {
            cbm = cbm as CommandBarMakerUnit;
            res.push(parseCommandBarMakerUnit(cbm));
        } else {
            cbm = cbm as CommandBarMakerUnit[];
            for (const cbmu of cbm) {
                res.push(parseCommandBarMakerUnit(cbmu));
            }
        }
        this.state.cmds.processed.push(this.state.cmds.commands);
        this.state.cmds.commands = [];
        let i = 0;
        for (const cmdset of res) {
            const [cmds, trig] = cmdset;
            for (const cmd of cmds) {
                const _i = i;
                // remove this command from commands if trigger is triggered
                // to prevent it from running again if other commands aren't triggered yet
                const rmCmdTrig = () => {
                    const res = trig();
                    if (res) {
                        this.state.cmds.commands[_i] = blank;
                    }
                    return res;
                };
                const c = cmd(rmCmdTrig, this.can, this.state);
                this.state.cmds.commands[_i] = c;
                i += 1;
            }
        }
    }
    // runs the command
    // returns true if there are more commands to run
    // returns false if there are no more commands to run
    run(delta: number) {
        const { cmds } = this.state;
        if (cmds.idx < 0 && cmds.queue.length) {
            // get first command ready
            cmds.idx = 0;
            this.assignNextCommandBar();
        }
        if (cmds.idx < cmds.queue.length) {
            // run current command and apply (cleaned) output
            // cmds.commands(this.cmdArgs);
            for (const cmd of cmds.commands) {
                cmd(this.cmds);
            }
            if (cmds.assignNext) {
                // assign next command bar
                cmds.assignNext = false;
                this.assignNextCommandBar();
            }
            this.state.tick += delta * 60;
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
        this.cmds = new CommandParam();
    }

    applyXY({ x, y, active }: { x: number; y: number; active: boolean }) {
        // x is left/right
        // y is forward/backward
        if (active) {
            let lft = -y + x;
            let rgt = -y - x;
            this.cmds.drive(lft, rgt);
        }
    }
}
