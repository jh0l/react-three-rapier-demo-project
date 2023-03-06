import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
export interface IntersectionRef {
    inters: THREE.Intersection<THREE.Object3D<THREE.Event>>[];
    raycaster: THREE.Raycaster;
    vector: THREE.Vector3;
    vecma: THREE.Vector3;
    canvas: OffscreenCanvasRenderingContext2D | null;
    color: number[];
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
export function useHookmaMap() {
    const compRef = useRef<THREE.Mesh>(null);
    const imageRef = useRef<THREE.Mesh>(null);
    const interRef = useRef<IntersectionRef>({
        inters: [] as THREE.Intersection<THREE.Object3D<THREE.Event>>[],
        raycaster: new THREE.Raycaster(),
        vector: new THREE.Vector3(),
        vecma: new THREE.Vector3(0, -1, 0),
        canvas: null as null | OffscreenCanvasRenderingContext2D,
        color: [],
    });
    const handleIntersection = () => {
        if (compRef.current === null || imageRef.current === null) return;
        const { raycaster, vector, vecma } = interRef.current;
        vector.setFromMatrixPosition(compRef.current.matrixWorld);
        raycaster.set(vector, vecma);
        // @ts-ignore
        const intersects = raycaster.intersectObject(imageRef.current);
        interRef.current.inters = intersects;
    };
    const getColorAtIntersection = () => {
        if (imageRef.current === null || interRef.current.inters.length === 0)
            return null;

        const { inters } = interRef.current;

        if (interRef.current.canvas === null) {
            const {
                image,
            } = // @ts-ignore
                (imageRef.current!.material as THREE.MeshBasicMaterial).map!;
            const canvas = new OffscreenCanvas(
                image.width,
                image.height
            ).getContext("2d");
            if (!canvas) return console.error("could not create canvas :(");
            interRef.current.canvas = canvas;
            console.log(imageRef.current);
            canvas.drawImage(image, 0, 0);
            const { scale } = imageRef.current;
            // @ts-ignore
            const { width, height } = image;
            console.log(scale, width, height);
            interRef.current.maps = {
                x: (x: number) =>
                    Math.floor(map(x, -scale.x / 2, scale.x / 2, 0, width)),
                y: (y: number) =>
                    Math.floor(map(y, -scale.y / 2, scale.y / 2, 0, height)),
            };
        }
        const inter = inters[0].point;
        const { canvas, maps } = interRef.current;

        const x = maps?.x(inter.x) || 0;
        const y = maps?.y(inter.z) || 0;
        const pixelData = canvas!.getImageData(
            x - SAMPLE_SIZE_HALF,
            y - SAMPLE_SIZE_HALF,
            SAMPLE_SIZE,
            SAMPLE_SIZE
        ).data;
        interRef.current.color = averageRGBAColorArr(pixelData);
    };
    useFrame(() => {
        handleIntersection();
        getColorAtIntersection();
    });
    return [compRef, imageRef, interRef] as const;
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
