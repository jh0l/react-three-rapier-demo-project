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
            <div ref={blocklyRef} className="h-1/2 w-full absolute top-0" />
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

export { Block, Category, Value, Field, Shadow };
