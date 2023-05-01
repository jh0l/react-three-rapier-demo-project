import BlocklyComponent, { BlocklyCategories } from "./BlocklyComponent";

export default function BlocklyEditor() {
    return (
        <BlocklyComponent
            className="h-1/2 w-full absolute bottom-0"
            readOnly={false}
            trashcan={true}
            renderer="zelos_custom"
            theme="zelos_custom"
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
                startScale: 0.7,
            }}
            grid={{
                spacing: 40,
                length: 3,
                colour: "#666666",
            }}
            comments={true}
            disable={true}
            sounds={true}
            initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
    <block type="lists_create_with" x="140" y="60">
        <mutation items="3"></mutation>
    </block>
</xml>
`}
        >
            <BlocklyCategories />
        </BlocklyComponent>
    );
}
