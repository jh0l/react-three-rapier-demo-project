import { useRef, useState } from "react";

// none is a special value used to detect an uninitialized ref
const none = {};
function useLazyRef(init: any) {
    return useState(init)[0];
}
export function useJitRef<T>(init: () => T): { current: T } {
    const value = useRef<T | {}>(none);
    const ref = useLazyRef(
        () =>
            ({
                get current() {
                    if (value.current === none) {
                        value.current = init();
                    }
                    return value.current;
                },
                set current(v) {
                    value.current = v;
                },
            } as { current: T })
    );
    return ref as { current: T };
}
