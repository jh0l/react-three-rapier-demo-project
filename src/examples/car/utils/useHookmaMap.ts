import * as THREE from "three";
import { useRef } from "react";
import { Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
interface IntersectionRef {
    intersections: THREE.Intersection<THREE.Object3D<THREE.Event>>[];
    raycaster: THREE.Raycaster;
    vector: THREE.Vector3;
    vecma: THREE.Vector3;
    canvas: OffscreenCanvasRenderingContext2D | null;
    color: number[];
}
export function useHookmaMap() {
    const compRef = useRef<THREE.Mesh>(null);
    const imageRef = useRef<typeof Image>(null);
    const intersectionsRef = useRef<IntersectionRef>({
        intersections: [] as THREE.Intersection<THREE.Object3D<THREE.Event>>[],
        raycaster: new THREE.Raycaster(),
        vector: new THREE.Vector3(),
        vecma: new THREE.Vector3(0, -1, 0),
        canvas: null as null | OffscreenCanvasRenderingContext2D,
        color: [],
    });
    const handleIntersection = () => {
        if (compRef.current === null || imageRef.current === null) return;
        const { raycaster, vector, vecma } = intersectionsRef.current;
        vector.setFromMatrixPosition(compRef.current.matrixWorld);
        raycaster.set(vector, vecma);
        // @ts-ignore
        const intersects = raycaster.intersectObject(imageRef.current);
        intersectionsRef.current.intersections = intersects;
    };
    const getColorAtIntersection = () => {
        if (
            imageRef.current === null ||
            intersectionsRef.current.intersections.length === 0
        )
            return null;

        const { intersections } = intersectionsRef.current;

        if (intersectionsRef.current.canvas === null) {
            const {
                image,
            } = // @ts-ignore
                (imageRef.current!.material as THREE.MeshBasicMaterial).map!;
            const canvas = new OffscreenCanvas(
                image.width,
                image.height
            ).getContext("2d");
            if (!canvas) return console.error("could not create canvas :(");
            intersectionsRef.current.canvas = canvas;
            console.log(image);
            canvas.drawImage(image, 0, 0);
            console.log(canvas);
        }
        const { canvas } = intersectionsRef.current;

        // @ts-ignore
        const image = imageRef.current!;
        // @ts-ignore
        const { scale, material } = image;
        const { width, height } = material.map.image;
        const inter = intersections[0].point;
        // TODO: arduino map function for inter.x & y min is -(image scale / 2) etc... to image PNG width and height
        // like this https://beta.tldraw.com/r/v2_c_fqQd3cnETm8lxcn9oK_vL 
        const x = inter.x;
        const y = inter.y;
        console.log(scale.x, scale.y, x, y);
        const pixelData = canvas!.getImageData(x, y, 1, 1).data;
        intersectionsRef.current.color = [...pixelData];
    };
    useFrame(() => {
        handleIntersection();
        getColorAtIntersection();
    });
    return [compRef, imageRef, intersectionsRef] as const;
}
