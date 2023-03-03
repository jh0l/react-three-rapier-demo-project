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
    color: [number, number, number];
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
        color: [0, 0, 0],
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
        // @ts-ignore
        const texture = (imageRef.current!.material as THREE.MeshBasicMaterial)
            .map!;
        if (intersectionsRef.current.canvas === null)
            intersectionsRef.current.canvas = new OffscreenCanvas(
                texture.image.width,
                texture.image.height
            ).getContext("2d");
        const { canvas } = intersectionsRef.current;
        const inter = intersections[0].point;
        const pixelData = canvas!.getImageData(inter.x, inter.y, 1, 1).data;
        intersectionsRef.current.color[0] = pixelData[0];
        intersectionsRef.current.color[1] = pixelData[1];
        intersectionsRef.current.color[2] = pixelData[2];
    };
    useFrame(() => {
        handleIntersection();
        getColorAtIntersection();
    });
    return [compRef, imageRef, intersectionsRef] as const;
}
