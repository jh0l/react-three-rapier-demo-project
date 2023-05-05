import React, { useEffect, useRef } from "react";

import Blockly, { WorkspaceSvg } from "blockly/core";
import { ContinuousToolbox } from "@blockly/continuous-toolbox";

import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";
import "./renderer/zelos_custom";
import "./plugins/block-plus-minus";
import * as localStorage from "./plugins/localStorage";
import "./blocks/events";
import "./blocks/commands_triggers";
import { useCommandQueue, useCommandStore } from "../app_state/useCommandStore";

Blockly.setLocale(locale);

type Props = Blockly.BlocklyOptions & {
    children: React.ReactNode;
    initialXml: string;
    className: string;
};

// @ts-ignore
class ContinuousToolboxFix extends ContinuousToolbox {
    init() {}
}

/** inject Blockly workspace into ReactDOM */
export default function BlocklyComponent(props: Props) {
    const { setWorkspace } = useCommandStore();
    const [textValue, setTextValue] = React.useState("");
    const [showButtons, setShowButtons] = React.useState(true);
    const blocklyRef = useRef<HTMLDivElement>(null);
    const toolboxRef = useRef<HTMLDivElement>(null);
    const workspcRef = useRef<WorkspaceSvg>();
    // const generateCode = () => {
    //     const fn = evalCode();
    //     console.log(fn());
    // };
    const toggleShowButtons = () => setShowButtons(!showButtons);

    const applyLocalStorage = () => {
        localStorage.saveString(textValue);
        if (workspcRef.current)
            localStorage.loadString(workspcRef.current, textValue);
    };

    useEffect(() => {
        const { initialXml, children, ...rest } = props;
        if (
            !blocklyRef.current ||
            !toolboxRef.current ||
            workspcRef.current != undefined
        )
            return;
        workspcRef.current = Blockly.inject(blocklyRef.current, {
            toolbox: toolboxRef.current,
            ...rest,
        });

        localStorage.load(workspcRef.current, initialXml);

        workspcRef.current.addChangeListener((e: any) => {
            if (
                "type" in e &&
                ["viewport_change", "selected", "drag"].includes(e.type)
            )
                return;

            if (workspcRef.current) {
                localStorage.save(workspcRef.current);
            }
        });

        setWorkspace(workspcRef.current);

        return () => {
            workspcRef.current?.dispose();
        };
    }, []);
    return (
        <>
            <div ref={blocklyRef} className={props.className} />
            <div ref={toolboxRef} style={{ display: "none" }}>
                {props.children}
            </div>
            <div className="absolute right-4 top-[51%] flex flex-col z-10 gap-2">
                {showButtons && (
                    <>
                        {/* <button
                            onClick={generateCode}
                            className=" bg-white border-solid border-black border rounded py-1 px-2 hover:shadow-md active:shadow-lg"
                        >
                            Generate Code
                        </button> */}
                        <textarea
                            className="w-44 h-12 border border-black p-3 rounded"
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                        />
                        <button
                            onClick={applyLocalStorage}
                            className=" bg-white border-solid border-black border rounded py-1 px-2 hover:shadow-md active:shadow-lg"
                        >
                            Apply Local Storage
                        </button>
                    </>
                )}
                <button
                    onClick={toggleShowButtons}
                    className=" bg-white border-solid border-black w-12 border rounded py-0 px-1 hover:shadow-md active:shadow-lg"
                >
                    {showButtons ? "Hide" : "Show"}
                </button>
            </div>
        </>
    );
}

type BlocklyTagProps = {
    children?: React.ReactNode;
    type?: string;
    name?: string;
    is?: string;
    categorystyle?: string;
    custom?: string;
    extraState?: any;
    items?: string;
    deletable?: string;
    movable?: string;
    editable?: string;
};
const BlocklyTag = (tag: string) => (props: BlocklyTagProps) => {
    const { children, ...rest } = props;
    rest.is = "blockly";
    return React.createElement(tag, rest, children);
};
const Block = BlocklyTag("block");
const Category = BlocklyTag("category");
const Value = BlocklyTag("value");
const Field = BlocklyTag("field");
const Shadow = BlocklyTag("shadow");
const Mutation = BlocklyTag("mutation");

function BlocklyCategories() {
    return (
        <>
            <Category name="Events" categorystyle="events_category">
                <Block type="events_start" />
            </Category>
            <Category name="Lists" categorystyle="list_category">
                <Block type="lists_create_with">
                    <Mutation items="3" />
                </Block>
                <Block type="lists_create_with" />
                <Block type="lists_length" />
                <Block type="lists_isEmpty" />
                <Block type="lists_reverse" />
            </Category>
            <Category name="Commands" categorystyle="commands_category">
                <Block type="commands_task_step" />
                <Block type="commands_go" />
                <Block type="commands_trace">
                    <Value name="NAME">
                        <Block type="math_number">
                            <Field name="NUM">1</Field>
                        </Block>
                    </Value>
                </Block>
                <Block type="commands_blank" />
                <Block type="commands_stop" />
                <Block type="commands_drive">
                    <Value name="angle">
                        <Block type="math_number">
                            <Field name="NUM">0</Field>
                        </Block>
                    </Value>
                    <Value name="speed">
                        <Block type="math_number">
                            <Field name="NUM">1</Field>
                        </Block>
                    </Value>
                </Block>
                <Block type="commands_probe">
                    <Value name="NAME">
                        <Block type="math_number">
                            <Field name="NUM">1</Field>
                        </Block>
                    </Value>
                </Block>
            </Category>
            <Category name="Triggers" categorystyle="triggers_category">
                <Block type="triggers_timer">
                    <Value name="TIME">
                        <Block type="math_number">
                            <Field name="NUM">0</Field>
                        </Block>
                    </Value>
                </Block>
                <Block type="triggers_intersection">
                    <Field name="NAME">R</Field>
                </Block>
                <Block type="triggers_done" />
            </Category>
            <Category
                name="Functions"
                categorystyle="procedure_category"
                custom="PROCEDURE"
            />
            <Category
                name="Variables"
                categorystyle="variable_category"
                custom="VARIABLE"
            />
        </>
    );
}

export { Block, Category, Value, Field, Shadow, BlocklyCategories };
