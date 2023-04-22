import React, { useEffect, useRef } from "react";

import Blockly, { WorkspaceSvg } from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import locale from "blockly/msg/en";
import "blockly/blocks";

Blockly.setLocale(locale);

type Props = Blockly.BlocklyOptions & {
    children: React.ReactNode;
    initialXml: string;
};

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
        if (!blocklyRef.current || !toolboxRef.current) return;
        workspcRef.current = Blockly.inject(blocklyRef.current, {
            toolbox: toolboxRef.current,
            ...rest,
        });

        if (initialXml) {
            Blockly.Xml.domToWorkspace(
                Blockly.utils.xml.textToDom(initialXml),
                workspcRef.current
            );
        }
    }, []);
    return (
        <>
            <button onClick={generateCode}>Generate Code</button>
            <div
                ref={blocklyRef}
                className="h-[46%] w-full absolute bottom-10"
            />
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

const autonomarsCategories = {
    kind: "categoryToolbox",
    contents: [
        {
            kind: "category",
            name: "Lists",
            categorystyle: "list_category",
            contents: [
                {
                    type: "lists_create_with",
                    kind: "block",
                },
                {
                    type: "lists_create_with",
                    kind: "block",
                },
                {
                    type: "lists_length",
                    kind: "block",
                },
                {
                    type: "lists_isEmpty",
                    kind: "block",
                },
                {
                    type: "lists_sort",
                    kind: "block",

                    fields: {
                        TYPE: "NUMERIC",
                        DIRECTION: "1",
                    },
                },
                {
                    type: "lists_reverse",
                    kind: "block",
                },
            ],
        },
        {
            kind: "category",
            name: "Functions",
            categorystyle: "procedure_category",
            custom: "PROCEDURE",
        },
        {
            kind: "category",
            name: "Variables",
            categorystyle: "variable_category",
            custom: "VARIABLE",
        },
    ],
};

export { Block, Category, Value, Field, Shadow, autonomarsCategories };
