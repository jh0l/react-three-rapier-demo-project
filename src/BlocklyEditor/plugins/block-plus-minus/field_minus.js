/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A function that creates a minus button used for mutation.
 */
'use strict';

import * as Blockly from 'blockly/core';
import {getExtraBlockState} from './serialization_helper';

/**
 * Creates a minus image field used for mutation.
 * @param {Object=} args Untyped args passed to block.minus when the field
 *     is clicked.
 * @returns {Blockly.FieldImage} The minus field.
 */
export function createMinusField(args = undefined) {
    const minus = new Blockly.FieldImage(
        minusImage,
        15,
        15,
        undefined,
        onClick_
    );
    /**
     * Untyped args passed to block.minus when the field is clicked.
     * @type {?(Object|undefined)}
     * @private
     */
    minus.args_ = args;
    return minus;
}

/**
 * Calls block.minus(args) when the minus field is clicked.
 * @param {Blockly.FieldImage} minusField The field being clicked.
 * @private
 */
function onClick_(minusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    const block = minusField.getSourceBlock();

    if (block.isInFlyout) {
        return;
    }

    Blockly.Events.setGroup(true);
    const oldExtraState = getExtraBlockState(block);
    block.minus(minusField.args_);
    const newExtraState = getExtraBlockState(block);

    if (oldExtraState != newExtraState) {
        Blockly.Events.fire(
            new Blockly.Events.BlockChange(
                block,
                'mutation',
                null,
                oldExtraState,
                newExtraState
            )
        );
    }
    Blockly.Events.setGroup(false);
}

const minusImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M20 14H4v-4h16'/%3E%3C/svg%3E";
