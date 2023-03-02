import {useEffect, useRef} from 'react';

export function useKeyPresses(event: (key: string, b: boolean) => void) {
    useEffect(() => {
        const downHandler = ({key}: KeyboardEvent) => event(key, true);
        const upHandler = ({key}: KeyboardEvent) => event(key, false);
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, []);
}

export type KeyMapType<T> = {[key: string]: T};
const keyMap: KeyMapType<string> = {
    ArrowUp: 'forward',
    w: 'forward',
    ArrowDown: 'backward',
    s: 'backward',
    ArrowLeft: 'left',
    a: 'left',
    ArrowRight: 'right',
    d: 'right',
    ' ': 'brake',
    r: 'reset',
};

export function useControls() {
    const keys = useRef<KeyMapType<boolean>>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        brake: false,
        reset: false,
    });
    useKeyPresses((key, b) => {
        if (key in keyMap && keyMap[key] in keys.current) {
            keys.current[keyMap[key]] = b;
        }
    });
    return keys;
}
