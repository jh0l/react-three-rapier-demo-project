import * as Blockly from "blockly/core";

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
    /**
     * Rounded corner radius.
     * @type {number}
     * @override
     */
    constructor() {
        super();
        this.CORNER_RADIUS = 5;
        this.TOP_ROW_MIN_HEIGHT = 8;
        this.BOTTOM_ROW_MIN_HEIGHT = 8;
    }

    init() {
        super.init();
        this.CORNER_RADIUS = 8;
        this.ROUNDED = super.makeSquared();
        this.CORNER_RADIUS = 5;
    }
}

class CustomRenderer extends Blockly.zelos.Renderer {
    constructor() {
        super("zelos_custom");
    }
    makeConstants_() {
        return new CustomConstantProvider();
    }
}

Blockly.blockRendering.register("zelos_custom", CustomRenderer);

Blockly.Theme.defineTheme("zelos_custom", {
    name: "zelos_custom",
    base: Blockly.Themes.Zelos,
    categoryStyles: {
        events_category: { colour: "#CF63CF" },
    },
    blockStyles: {
        event_blocks: {
            colourPrimary: "#CF63CF",
            colourSecondary: "#A651A6",
            colourTertiary: "#9C439C",
            hat: "cap",
        },
    },
});
