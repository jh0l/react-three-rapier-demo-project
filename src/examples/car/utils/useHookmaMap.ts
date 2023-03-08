import * as THREE from "three";
import { RefObject, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as StackBlur from "stackblur-canvas";
export interface CanvasRef {
    canvas: OffscreenCanvasRenderingContext2D | null;
    color: Uint8ClampedArray[];
    maps?: {
        x: (x: number) => number;
        y: (y: number) => number;
    };
}

type FloatyBoxesType = React.MutableRefObject<
    RefObject<
        THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
    >[]
>;
const REFACPLS_LOL = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
];
export function useHookmaMap(
    floatyBoxesRef: FloatyBoxesType,
    setMap: React.Dispatch<React.SetStateAction<string>>
) {
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
            const canvasEl = new OffscreenCanvas(image.width, image.height);
            console.log(imageRef.current);
            const canvas = canvasEl.getContext("2d");
            if (!canvas) return console.error("could not create canvas :(");
            canvas.drawImage(image, 0, 0);
            // blur canvas image  at initialisation to save on averaging a bunch of pixels
            // must support safari
            // @ts-ignore
            // try using StackBlur.imageDataRGBA and .putImageData?
            StackBlur.canvasRGB(canvasEl, 0, 0, image.width, image.height, 20);
            // debug
            canvasEl.convertToBlob().then((b) => {
                const url = URL.createObjectURL(b);
                setMap(url);
                canvasRef.current.canvas = canvas;
            });
            const { scale } = imageRef.current;
            // @ts-ignore
            const { width, height } = image;
            canvasRef.current.maps = {
                x: (x: number) =>
                    Math.floor(map(x, -scale.x / 2, scale.x / 2, 0, width)),
                y: (y: number) =>
                    Math.floor(map(y, -scale.y / 2, scale.y / 2, 0, height)),
            };
        } else {
            const { canvas, maps } = canvasRef.current;
            canvasRef.current.color = [];
            for (let i = 0; i < floatyBoxesRef.current.length; i++) {
                const box = floatyBoxesRef.current[i];
                if (!box.current) return;
                const offset = box.current.getWorldPosition(REFACPLS_LOL[i]);
                const x = maps?.x(offset.x) || 0;
                const y = maps?.y(offset.z) || 0;
                const pixelData = canvas.getImageData(x, y, 1, 1).data;
                canvasRef.current.color.push(pixelData);
            }
        }
    };
    useFrame(() => {
        getColorAtIntersection();
    });
    return [imageRef, canvasRef] as const;
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
