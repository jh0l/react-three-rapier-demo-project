import BlocklyComponent, {
    Block,
    Field,
    Shadow,
    Value,
    autonomarsCategories,
} from "./BlocklyComponent";

export default function BlocklyEditor() {
    return (
        <BlocklyComponent
            readOnly={false}
            trashcan={true}
            renderer="zelos"
            theme="zelos"
            toolbox={autonomarsCategories}
            collapse={true}
            media="media/"
            move={{
                scrollbars: true,
                drag: true,
                wheel: false,
            }}
            zoom={{
                controls: true,
                wheel: true,
                startScale: 0.8,
            }}
            grid={{
                spacing: 40,
                length: 3,
                colour: "#888888",
                snap: true,
            }}
            comments={true}
            disable={true}
            sounds={true}
            initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="140" y="60"></block>
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
