import BlocklyComponent, { BlocklyCategories } from "./BlocklyComponent";

export default function BlocklyEditor() {
    return (
        <BlocklyComponent
            className="h-1/2 w-full absolute bottom-0"
            readOnly={false}
            trashcan={true}
            renderer="zelos_custom"
            theme="zelos"
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
            <BlocklyCategories />
        </BlocklyComponent>
    );
}
