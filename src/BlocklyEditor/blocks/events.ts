import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

// create custom block called 'on_start' that captures blocks
// to be generated when code generation is triggered

const events = Blockly.common.createBlockDefinitionsFromJsonArray([
    {
        type: "events_start",
        message0: "Start",
        args0: [],
        message1: "%1",
        args1: [
            {
                type: "input_value",
                name: "STACK",
                check: "Array",
            },
        ],
        // nextStatement: null,
        style: "event_blocks",
        tooltop: "command queue when job started",
        helpUrl: "",
    },
    {
        type: "intersection_type",
        message0: "%1",
        args0: [
            {
                type: "field_dropdown",
                name: "CONSTANT",
                options: [
                    ["Right", '"R"'],
                    ["Left", '"L"'],
                    ["Top", '"T"'],
                ],
            },
        ],
        output: "String",
        style: "event_blocks",
        tooltip: "Intersection type",
        helpUrl: "Work in progress :)",
    },
]);

Blockly.common.defineBlocks(events);

javascriptGenerator["events_start"] = function (block: Blockly.Block) {
    const array = javascriptGenerator.valueToCode(
        block,
        "STACK",
        javascriptGenerator.ORDER_NONE
    );
    return `() => ${array};\n`;
};

javascriptGenerator["intersection_type"] = function (block: Blockly.Block) {
    const dropdown_constant = block.getFieldValue("CONSTANT");
    return [dropdown_constant, javascriptGenerator.ORDER_NONE];
};
