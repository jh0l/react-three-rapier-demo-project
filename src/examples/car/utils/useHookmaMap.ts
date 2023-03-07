import * as THREE from "three";
import { RefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
export interface CanvasRef {
    canvas: OffscreenCanvasRenderingContext2D | null;
    color: number[][];
    maps?: {
        x: (x: number) => number;
        y: (y: number) => number;
    };
}
// average the rgb values of rgba (w/ alpha!) ImageData array to get a single color
function averageRGBAColorArr(arr: Uint8ClampedArray) {
    let res = [0, 0, 0];
    for (let i = 0; i < arr.length; i += 4) {
        res[0] += arr[i];
        res[1] += arr[i + 1];
        res[2] += arr[i + 2];
    }
    res[0] = Math.floor(res[0] / (arr.length / 4));
    res[1] = Math.floor(res[1] / (arr.length / 4));
    res[2] = Math.floor(res[2] / (arr.length / 4));
    return res;
}
type FloatyBoxesType = React.MutableRefObject<
    RefObject<
        THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
    >[]
>;
export function useHookmaMap(floatyBoxesRef: FloatyBoxesType) {
    const imageRef = useRef<THREE.Mesh>(null);
    const canvasRef = useRef<CanvasRef>({
        canvas: null as null | OffscreenCanvasRenderingContext2D,
        color: [],
    });
    const getColorAtIntersection = () => {
        if (!imageRef.current) return null;

        if (canvasRef.current.canvas === null) {
            const {
                image,
            } = // @ts-ignore
                (imageRef.current!.material as THREE.MeshBasicMaterial).map!;
            const canvas = new OffscreenCanvas(
                image.width,
                image.height
            ).getContext("2d");
            if (!canvas) return console.error("could not create canvas :(");
            canvasRef.current.canvas = canvas;
            console.log(imageRef.current);
            canvas.drawImage(image, 0, 0);
            const { scale } = imageRef.current;
            // @ts-ignore
            const { width, height } = image;
            canvasRef.current.maps = {
                x: (x: number) =>
                    Math.floor(map(x, -scale.x / 2, scale.x / 2, 0, width)),
                y: (y: number) =>
                    Math.floor(map(y, -scale.y / 2, scale.y / 2, 0, height)),
            };
        }
        const { canvas, maps } = canvasRef.current;
        canvasRef.current.color = [];
        for (let box of floatyBoxesRef.current) {
            if (!box.current) return;
            const offset = box.current.getWorldPosition();
            const x = maps?.x(offset.x) || 0;
            const y = maps?.y(offset.z) || 0;
            const pixelData = canvas!.getImageData(
                x - SAMPLE_SIZE_HALF,
                y - SAMPLE_SIZE_HALF,
                SAMPLE_SIZE,
                SAMPLE_SIZE
            ).data;
            canvasRef.current.color.push(averageRGBAColorArr(pixelData));
        }
    };
    useFrame(() => {
        getColorAtIntersection();
    });
    return [imageRef, canvasRef] as const;
}
const SAMPLE_SIZE = 10;
const SAMPLE_SIZE_HALF = SAMPLE_SIZE / 2;
function map(
    x: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
