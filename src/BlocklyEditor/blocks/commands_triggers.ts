import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

const defs = [
    {
        type: "commands_task_step",
        message0: "task step %1 %2 %3",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "COMMAND",
                check: ["command", "Array"],
            },
            {
                type: "input_value",
                name: "TRIGGER",
                check: "trigger",
            },
        ],
        inputsInline: true,
        output: "Array",
        style: "event_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_go",
        message0: "go",
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "triggers_timer",
        message0: "timer %1 %2",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "TIME",
                check: "Number",
                align: "RIGHT",
            },
        ],
        inputsInline: true,
        output: "trigger",
        style: "trigger_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "triggers_intersection",
        message0: "intersection %1",
        args0: [
            {
                type: "field_dropdown",
                name: "NAME",
                options: [
                    ["Right", "R"],
                    ["Left", "L"],
                    ["Top", "T"],
                    ["Horizontal", "I"],
                ],
            },
        ],
        inputsInline: true,
        output: "trigger",
        style: "trigger_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_trace",
        message0: "trace %1 %2",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "NAME",
                check: "Number",
            },
        ],
        inputsInline: true,
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_blank",
        message0: "blank",
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "triggers_done",
        message0: "done",
        output: "trigger",
        style: "trigger_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_align",
        message0: "align",
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_stop",
        message0: "stop",
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_drive",
        message0: "drive %1 %2 %3",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "angle",
                check: "Number",
            },
            {
                type: "input_value",
                name: "speed",
                check: "Number",
            },
        ],
        inputsInline: true,
        output: "command",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_probe",
        message0: "probe %1 %2",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "NAME",
                check: "Number",
            },
        ],
        inputsInline: true,
        output: "commmand",
        style: "command_blocks",
        tooltip: "",
        helpUrl: "",
    },
    {
        type: "commands_task_step",
        message0: "task step %1 %2 %3",
        args0: [
            {
                type: "input_dummy",
            },
            {
                type: "input_value",
                name: "COMMAND",
                check: ["command", "Array"],
            },
            {
                type: "input_value",
                name: "TRIGGER",
                check: "trigger",
            },
        ],
        inputsInline: true,
        output: "Array",
        colour: 230,
        tooltip: "",
        helpUrl: "",
    },
];

Blockly.defineBlocksWithJsonArray(defs);

javascriptGenerator["commands_task_step"] = function (block: Blockly.Block) {
    var value_command = javascriptGenerator.valueToCode(
        block,
        "COMMAND",
        javascriptGenerator.ORDER_ATOMIC
    );
    var value_trigger = javascriptGenerator.valueToCode(
        block,
        "TRIGGER",
        javascriptGenerator.ORDER_ATOMIC
    );
    // TODO: Assemble JavaScript into code variable.
    var code = `[${value_command}, ${value_trigger}]`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_go"] = function (_block: Blockly.Block) {
    // TODO: Assemble JavaScript into code variable.
    var code = "go";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["triggers_timer"] = function (block: Blockly.Block) {
    var value_time = javascriptGenerator.valueToCode(
        block,
        "TIME",
        javascriptGenerator.ORDER_ATOMIC
    );
    // TODO: Assemble JavaScript into code variable.
    var code = `timer(${value_time})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["triggers_intersection"] = function (block: Blockly.Block) {
    var dropdown_name = block.getFieldValue("NAME");
    // TODO: Assemble JavaScript into code variable.
    var code = `intersection('${dropdown_name}')`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_trace"] = function (block: Blockly.Block) {
    var value_name = javascriptGenerator.valueToCode(
        block,
        "NAME",
        javascriptGenerator.ORDER_ATOMIC
    );
    // TODO: Assemble JavaScript into code variable.
    var code = `trace(${value_name})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_blank"] = function (_block: Blockly.Block) {
    // TODO: Assemble JavaScript into code variable.
    var code = "blank";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["triggers_done"] = function (_block: Blockly.Block) {
    // TODO: Assemble JavaScript into code variable.
    var code = "done";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_align"] = function (_block: Blockly.Block) {
    // TODO: Assemble JavaScript into code variable.
    var code = "align";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_stop"] = function (_block: Blockly.Block) {
    // TODO: Assemble JavaScript into code variable.
    var code = "stop";
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_drive"] = function (block: Blockly.Block) {
    var value_angle = javascriptGenerator.valueToCode(
        block,
        "angle",
        javascriptGenerator.ORDER_ATOMIC
    );
    var value_speed = javascriptGenerator.valueToCode(
        block,
        "speed",
        javascriptGenerator.ORDER_ATOMIC
    );

    // TODO: Assemble JavaScript into code variable.
    // surround angle and speed in [] because CommandMakerMaker param allows 1 argument only
    var code = `drive([${value_angle}, ${value_speed}])`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator["commands_probe"] = function (block: Blockly.Block) {
    var value_name = javascriptGenerator.valueToCode(
        block,
        "NAME",
        javascriptGenerator.ORDER_ATOMIC
    );
    // TODO: Assemble JavaScript into code variable.
    var code = `probe(${value_name})`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, javascriptGenerator.ORDER_ATOMIC];
};
