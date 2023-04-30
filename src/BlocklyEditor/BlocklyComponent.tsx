import React, { useEffect, useRef } from "react";

import Blockly, { WorkspaceSvg } from "blockly/core";
import { ContinuousToolbox } from "@blockly/continuous-toolbox";

import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";
import "./renderer/zelos_custom";
import "./plugins/block-plus-minus";
import * as localStorage from "./plugins/localStorage";

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
    const blocklyRef = useRef<HTMLDivElement>(null);
    const toolboxRef = useRef<HTMLDivElement>(null);
    const workspcRef = useRef<WorkspaceSvg>();
    const generateCode = () => {
        const code = javascriptGenerator.workspaceToCode(workspcRef.current);
        console.log(code);
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

        workspcRef.current.addChangeListener(() => {
            if (workspcRef.current) {
                localStorage.save(workspcRef.current);
            }
        });

        return () => {
            workspcRef.current?.dispose();
        };
    }, []);
    return (
        <>
            <button onClick={generateCode}>Generate Code</button>
            <div ref={blocklyRef} className={props.className} />
            <div ref={toolboxRef} style={{ display: "none" }}>
                {props.children}
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
            <Category name="Control" categorystyle="Control_category" />
            <Category name="Lists" categorystyle="list_category">
                <Block type="lists_create_with">
                    <Mutation items="3" />
                </Block>
                <Block type="lists_create_with" />
                <Block type="lists_length" />
                <Block type="lists_isEmpty" />
                <Block type="lists_reverse" />
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
