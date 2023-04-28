import * as Blockly from 'blockly/core';

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
        this.CORNER_RADIUS = 16;
        this.ROUNDED = super.makeSquared();
        this.CORNER_RADIUS = 5;
    }
}

class CustomRenderer extends Blockly.zelos.Renderer {
    constructor() {
        super();
    }
    makeConstants_() {
        return new CustomConstantProvider();
    }
}

Blockly.blockRendering.register('zelos_custom', CustomRenderer);
