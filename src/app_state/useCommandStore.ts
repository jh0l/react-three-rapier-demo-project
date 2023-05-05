/**
<App>
    <Scene>
        <Level>
            <CarEntity>
                <Start />
                <autoTraceVehicle()>
                    <CommandQueue />
                </autoTraceVehicle()>
            </CarEntity>
        </Level>
    </Scene>
    <BlocklyEditor>
        <BlocklyComponent>
            <Workspace/>
            <Toolbox/>
        </BlocklyComponent>
    </BlocklyEditor>
</App>

Requirements
    - Hot swappable workspace for different objects i.e
        CarEntity (Parameters, Commands), Level(InstanceN)
    - autoTraceVehicle gets queue from App state, app state decides (zustand decides from state specifying where commands come from i.e BlocklyEditor? sourced from demo? URL?)
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { CommandBarMakerUnit, evalCommandQueue } from "../lib/commandlib";

interface CommandState {
    workspace: Blockly.WorkspaceSvg | null;
    setWorkspace: (workspace: Blockly.WorkspaceSvg) => void;
}

export const useCommandStore = create<CommandState>()(
    devtools((set) => ({
        workspace: null,
        setWorkspace: (workspace) => set({ workspace }),
    }))
);

export function useCommandQueue(): () => () =>
    | (CommandBarMakerUnit | null)[]
    | null {
    const { workspace } = useCommandStore();
    return () => {
        if (!workspace) return () => null;
        const code = javascriptGenerator.workspaceToCode(workspace) as string;
        return evalCommandQueue(code);
    };
}
