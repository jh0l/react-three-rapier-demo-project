/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field for a plus button used for mutation.
 */
'use strict';

import * as Blockly from 'blockly/core';
import {getExtraBlockState} from './serialization_helper';

/**
 * Creates a plus image field used for mutation.
 * @param {Object=} args Untyped args passed to block.minus when the field
 *     is clicked.
 * @returns {Blockly.FieldImage} The Plus field.
 */
export function createPlusField(args = undefined) {
    const plus = new Blockly.FieldImage(plusImage, 20, 20, undefined, onClick_);
    /**
     * Untyped args passed to block.plus when the field is clicked.
     * @type {?(Object|undefined)}
     * @private
     */
    plus.args_ = args;
    return plus;
}

/**
 * Calls block.plus(args) when the plus field is clicked.
 * @param {!Blockly.FieldImage} plusField The field being clicked.
 * @private
 */
function onClick_(plusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    const block = plusField.getSourceBlock();

    if (block.isInFlyout) {
        return;
    }

    Blockly.Events.setGroup(true);
    const oldExtraState = getExtraBlockState(block);
    block.plus(plusField.args_);
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

const plusImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4v4Zm1 5q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z'/%3E%3C/svg%3E";
