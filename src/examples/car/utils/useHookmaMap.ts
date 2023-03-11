import * as THREE from "three";
import { RefObject, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
export interface CanvasRef {
    canvas: CanvasRenderingContext2D | null;
    color: Uint8ClampedArray[];
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

export function useHookmaMap(floatyBoxesRef: FloatyBoxesType) {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    useEffect(() => {
        const img = new Image();
        img.src = "map_blurred.png";
        img.onload = () => {
            setImage(img);
        };
    }, []);
    const canvasRef = useRef<CanvasRef>({
        canvas: null as null | CanvasRenderingContext2D,
        color: [],
        vectors: [],
    });
    const STUPID_VEC = new THREE.Vector3();
    const getColorAtIntersection = () => {
        if (!image) return null;
        if (canvasRef.current.canvas === null) {
            const { width, height } = image;

            const canvasEl = document.createElement("canvas")
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
            canvasRef.current.color = [];
            canvasRef.current.vectors = [];
            for (let i = 0; i < floatyBoxesRef.current.length; i++) {
                const box = floatyBoxesRef.current[i];
                if (!box.current) return;
                const offset = box.current.getWorldPosition(STUPID_VEC);
                const x = maps?.x(offset.x) || 0;
                const y = maps?.y(offset.z) || 0;
                const pixelData = canvas.getImageData(x, y, 1, 1).data;
                canvasRef.current.color.push(pixelData);
                canvasRef.current.vectors.push([x, y]);
            }
        }
    };
    useFrame(() => {
        getColorAtIntersection();
    });
    return [canvasRef] as const;
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
