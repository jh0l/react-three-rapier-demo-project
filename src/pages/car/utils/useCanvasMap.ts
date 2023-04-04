import * as THREE from "three";
import { RefObject, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useJitRef } from "../../../utils";

class Luminance {
    top = 0;
    lft = 0;
    bot = 0;
    rgt = 0;
    set(value: number, side: string | number) {
        value = Math.trunc(value * 100) / 100;
        if (side === "top" || side === 0) this.top = value;
        else if (side === "lft" || side === 1) this.lft = value;
        else if (side === "bot" || side === 2) this.bot = value;
        else if (side === "rgt" || side === 3) this.rgt = value;
        else console.warn("unknown side", side);
    }
    get(number: number): number {
        if (number === 0) return this.top;
        if (number === 1) return this.lft;
        if (number === 2) return this.bot;
        if (number === 3) return this.rgt;
        return NaN;
    }
    map<T>(fn: (x: number) => T): T[] {
        return [fn(this.top), fn(this.lft), fn(this.bot), fn(this.rgt)];
    }
    keys() {
        return { top: this.top, lft: this.lft, bot: this.bot, rgt: this.rgt };
    }
}
export interface CanvasRes {
    canvas: CanvasRenderingContext2D | null;
    luminance: Luminance;
    maps?: {
        x: (x: number) => number;
        y: (y: number) => number;
    };
    vectors: number[][];
}

type FloatyBoxesType = React.MutableRefObject<
    RefObject<
        THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
    >[]
>;

export const MAP_SCALE = 55;
export const MAP_ASP = 1.75;

export function useCanvasMap(floatyBoxesRef: FloatyBoxesType) {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    useEffect(() => {
        const img = new Image();
        img.src = "map_blurred.png";
        img.onload = () => {
            setImage(img);
        };
    }, []);
    const canvasRef = useJitRef<CanvasRes>(() => ({
        canvas: null as null | CanvasRenderingContext2D,
        luminance: new Luminance(),
        vectors: [],
    }));
    const STUPID_VEC = new THREE.Vector3();
    const getColorAtIntersection = () => {
        if (!image) return null;
        if (canvasRef.current.canvas === null) {
            const { width, height } = image;

            const canvasEl = document.createElement("canvas");
            canvasEl.width = width;
            canvasEl.height = height;
            const canvas = canvasEl.getContext("2d");
            if (!canvas) return console.error("could not create canvas :(");
            canvas.drawImage(image, 0, 0);
            canvasRef.current.canvas = canvas;
            const scale = { y: MAP_SCALE, x: MAP_SCALE * MAP_ASP };
            canvasRef.current.maps = {
                x: (x: number) =>
                    Math.floor(map(x, -scale.x / 2, scale.x / 2, 0, width)),
                y: (y: number) =>
                    Math.floor(map(y, -scale.y / 2, scale.y / 2, 0, height)),
            };
        } else {
            const { canvas, maps } = canvasRef.current;
            canvasRef.current.vectors = [];
            for (let i = 0; i < floatyBoxesRef.current.length; i++) {
                const box = floatyBoxesRef.current[i];
                if (!box.current) return;
                const offset = box.current.getWorldPosition(STUPID_VEC);
                const x = maps?.x(offset.x) || 0;
                const y = maps?.y(offset.z) || 0;
                const pixelData = canvas.getImageData(x, y, 1, 1).data;
                canvasRef.current.luminance.set(lumFloat(pixelData), i);
                canvasRef.current.vectors.push([x, y]);
            }
        }
    };
    useFrame(() => {
        getColorAtIntersection();
    });
    return [canvasRef] as const;
}

// calculate luminance and
function lumFloat(array: Uint8ClampedArray): number {
    return (0.2126 * array[0] + 0.7152 * array[1] + 0.0722 * array[2]) / 255;
}

function map(
    x: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
