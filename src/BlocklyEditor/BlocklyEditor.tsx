import BlocklyComponent, {
    Block,
    Field,
    Shadow,
    Value,
} from "./BlocklyComponent";

export default function BlocklyEditor() {
    return (
        <BlocklyComponent
            readOnly={false}
            trashcan={true}
            renderer="zelos"
            theme="zelos"
            toolbox={{
                kind: "categoryToolbox",
                contents: [
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
            }}
            collapse={true}
            media="media/"
            move={{
                scrollbars: true,
                drag: true,
                wheel: true,
            }}
            initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
`}
        >
            <Block type="controls_ifelse" />
            <Block type="controls_repeat_ext">
                <Value name="TIMES">
                    <Shadow type="math_number">
                        <Field name="NUM">10</Field>
                    </Shadow>
                </Value>
            </Block>
        </BlocklyComponent>
    );
}
