import * as Blockly from "blockly/core";

const storageKey = "autonomars_blockly_workspace";

/** Saves the state of the workspace to browser's local storage. */
export const save = function (workspace: Blockly.Workspace) {
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

export const saveString = (str: string) => {
    window.localStorage?.setItem(storageKey, str);
};

export const loadString = (workspace: Blockly.Workspace, data: string) => {
    Blockly.Events.disable();
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, {
        recordUndo: false,
    });
    Blockly.Events.enable();
};

/** Loads saved state from local storage into the given workspace. */
export const load = function (
    workspace: Blockly.Workspace,
    initialXml?: string
) {
    const data = window.localStorage?.getItem(storageKey);
    if (!data) {
        if (initialXml) {
            Blockly.Xml.domToWorkspace(
                Blockly.utils.xml.textToDom(initialXml),
                workspace
            );
        }
        return;
    }

    // Don't emit events during loading.
    loadString(workspace, data);
};
