import { Image, Box, Cylinder } from "@react-three/drei";
import { MAP_ASP, MAP_SCALE } from "./utils/useCanvasMap";
import { CarEntity } from "./CarEntity";
import Truckma from "./models/Truckma";
import { MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import {
    RapierRigidBody,
    RigidBody,
    RigidBodyProps,
} from "@react-three/rapier";
import { RefObject, forwardRef, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { mapLinear } from "three/src/math/MathUtils";

export default function Level() {
    return (
        <>
            {/* approaching fuelstation again */}
            {/* <CarEntity position={[-19, -5.3, -13.0]} rotation={[0, 0, 0]} /> */}
            <CarEntity position={[-40, -3, 15]} />
            {/* <CarEntity position={[-20, -3, 10]} /> */}
            <Map map_url="map.png" />
            <FuelStation />
        </>
    );
}

const YELLOW_STD = new MeshStandardMaterial({
    color: "rgb(190, 150, 0)",
    opacity: 0.95,
    transparent: true,
});

const GRAY_STD = new MeshStandardMaterial({
    color: "#333",
    opacity: 0.9,
    transparent: true,
});

function FuelStation() {
    const pushyRef = useRef<RapierRigidBody>(null);
    return (
        <group position={[-43.24, -5, -11.94]}>
            {/* MAIN BOX */}
            <RigidBody type="fixed" friction={0}>
                <Box
                    scale={[2, 2.95, 5.74]}
                    position={[1.1, -0.01, 0]}
                    material={YELLOW_STD}
                    receiveShadow
                />
                {/* FLOOR */}
                <Box
                    scale={[4.2, 0.5, 5.74]}
                    position={[0, -1.75, 0]}
                    material={YELLOW_STD}
                    receiveShadow
                />
                {/* SLIDE */}
                <Box
                    scale={[2.5, 0.5, 6]}
                    position={[-0.67, 0.1, 0]}
                    rotation={[Math.PI / 8, 0, 0]}
                    material={YELLOW_STD}
                    receiveShadow
                />
                {/* BRIDGE */}
                <Box scale={[3.5, 0.5, 0.5]} position={[3.74, 0, -1.46]}>
                    <meshStandardMaterial color="black" />
                </Box>
                <Box scale={[3.5, 0.5, 0.5]} position={[3.74, -1, -1.46]}>
                    <meshStandardMaterial color="black" />
                </Box>
                {/* FRONT BOX */}
                <Box
                    scale={[2.7, 3.5, 4.1]}
                    position={[6.39, -0.75, -1.46]}
                    material={YELLOW_STD}
                />
                {/* RESTBOX */}
                <Box scale={[0.5, 0.5, 1.12]} position={[8.24, -1.5, -1.46]}>
                    <meshStandardMaterial color="orange" />
                </Box>
                {/* TOPBOX (limits PUSHY BOY) */}
                <Box scale={[0.5, 0.5, 1.12]} position={[8.24, 0.6, -1.46]}>
                    <meshStandardMaterial color="orange" />
                </Box>
            </RigidBody>
            {/* PUSHY BOY */}
            <PushyBoy ref={pushyRef} />
            <UnitStack pushyRef={pushyRef} />
            <Truckma position={[-0.7, 0, 7.2]} />
        </group>
    );
}

const HOTPINK_PHYS = new MeshPhysicalMaterial({
    color: "#ff00ff",
    // @ts-ignore
    iridescence: 1,
    iridescenceIOR: 1,
    // iridescenceThicknessRange={[0, 1400]}
    roughness: 1,
    clearcoat: 0.5,
    metalness: 0.75,
});
const FuelUnit = (props: RigidBodyProps) => (
    <RigidBody
        gravityScale={0.8}
        {...props}
        scale={0.8}
        friction={0.4}
        mass={2}
        colliders="cuboid"
    >
        <Cylinder
            args={[2 / 3, 2 / 3, 1, 10]}
            castShadow
            material={HOTPINK_PHYS}
        />
    </RigidBody>
);

const FS_PUSHER_REF = {
    target: {
        start: -1,
    },
    source: {
        start: -1,
    },
};

const PushyBoy = forwardRef<RapierRigidBody>((_, ref) => {
    return (
        <RigidBody
            enabledTranslations={[false, true, false]}
            lockRotations={true}
            ref={ref}
            position={[8.24, -1, -1.46]}
        >
            <Box scale={[0.5, 0.5, 4.1]} material={GRAY_STD}></Box>
        </RigidBody>
    );
});

const HOLDER_RAD = 0.65;
const UnitStack = ({ pushyRef }: { pushyRef: RefObject<RapierRigidBody> }) => {
    const { stored } = useFuelStationStore();
    const pusherRef = useRef<RapierRigidBody>(null);
    useFrame(() => {
        if (FS_PUSHER_REF.target.start === -1) return;
        if (pusherRef.current && pushyRef && pushyRef.current) {
            const trans = pusherRef.current.translation();
            const sourceZ = pushyRef.current.translation().y;
            const sourceStart = FS_PUSHER_REF.source.start;
            const sourceEnd = sourceStart + 28;
            const targetStart = FS_PUSHER_REF.target.start;
            const targetEnd = targetStart - 32;
            const mapX = mapLinear(
                sourceZ,
                sourceStart,
                sourceEnd,
                targetStart,
                targetEnd
            );
            trans.x = mapX;
            pusherRef.current.setTranslation(trans, false);
        }
    });
    useLayoutEffect(() => {
        setTimeout(() => {
            if (
                FS_PUSHER_REF.target.start === -1 &&
                pusherRef.current &&
                pushyRef.current
            ) {
                FS_PUSHER_REF.target.start = pusherRef.current.translation().x;
                FS_PUSHER_REF.source.start = pushyRef.current?.translation().y;
            }
        }, 500);
    }, []);
    return (
        <>
            <group position={[0.5, 2, -2]}>
                {/* holder */}
                <RigidBody type="fixed">
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[HOLDER_RAD, 3.1, 0]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[-HOLDER_RAD, 3.1, 0]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[0, 2.1, HOLDER_RAD - 0.1]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[0, 2.1, -HOLDER_RAD + 0.1]}
                        material={YELLOW_STD}
                    />
                    {/* SLIDE GUIDE*/}
                    <Box
                        scale={[0.2, 5, 2]}
                        position={[-2, 1, 0]}
                        material={YELLOW_STD}
                    />
                </RigidBody>
                {/* pusher */}
                <RigidBody ref={pusherRef} type="fixed">
                    <Box
                        scale={[1.2, 2 / 3, 1]}
                        position={[1.3, -0.1, 0]}
                        material={GRAY_STD}
                    />
                </RigidBody>
                {Array(stored)
                    .fill(0)
                    .map((_, i) => (
                        <FuelUnit
                            position={[0, i * 1.01, 0]}
                            key={i + 1}
                            rotation={[Math.PI / 2, Math.PI / 2, 0]}
                        />
                    ))}
            </group>
        </>
    );
};

// const WHEEL_POS: Vector3Array[] = [
//     [1.26, -0.9, 1.25],
//     [1.26, -0.9, -0.05],
//     [-1.25, -0.9, -1.4],
//     [-1.25, -0.9, 1.25],
//     [-1.25, -0.9, -0.05],
//     [1.26, -0.9, -1.4],
// ];

// const WHEEL_ARGS: [number, number, number, number] = [0.45, 0.45, 0.45, 16];

// const WHEEL_ROT: Vector3Array = [0, 0, Math.PI / 2];
// const TORUS = new TorusGeometry(1.2, 0.3, 4, 4);
// const Car = () => {
//     return (
//         <RigidBody colliders={false} position={[-0.72, 1, 5.9]} scale={1.2}>
//             <CuboidCollider
//                 args={[2, 2, 3]}
//                 scale={0.5}
//                 position={[0, 0, -0.81]}
//             />
//             <Box
//                 scale={[2, 2, 3]}
//                 position={[0, 0, -0.81]}
//                 material={YELLOW_STD}
//             />
//             <TrimeshCollider
//                 args={[
//                     // @ts-ignore
//                     TORUS.attributes.position.array,
//                     // @ts-ignore
//                     TORUS.index.array,
//                 ]}
//                 position={[0, 0, 1.56]}
//                 rotation={[-Math.PI / 3.2, 0, Math.PI / 4]}
//             />
//             <mesh
//                 geometry={TORUS}
//                 material={YELLOW_STD}
//                 position={[0, 0, 1.56]}
//                 rotation={[-Math.PI / 3.2, 0, Math.PI / 4]}
//             />
//             {WHEEL_POS.map((pos, i) => (
//                 <Cylinder
//                     args={WHEEL_ARGS}
//                     rotation={WHEEL_ROT}
//                     position={pos}
//                     material={GRAY_STD}
//                     key={i + 1}
//                 />
//             ))}
//             <CuboidCollider
//                 args={[0.45, 0.9, 3.55]}
//                 scale={0.5}
//                 position={[1.25, -0.9, -0.07]}
//             />
//             <CuboidCollider
//                 args={[0.45, 0.9, 3.55]}
//                 scale={0.5}
//                 position={[-1.25, -0.9, -0.07]}
//             />
//         </RigidBody>
//     );
// };

interface FuelStationState {
    isDropped: boolean;
    isLifted: boolean;
    stored: number;
    // array of IDs for units that have been spawned
    units: string[];
}

export const useFuelStationStore = create<FuelStationState>()(
    devtools((set) => ({
        isDropped: false,
        isLifted: false,
        stored: 6,
        units: ["bing"],
        setDropped: (v: boolean) => set({ isDropped: v }),
        setLifted: (v: boolean) => set({ isLifted: v }),
        setStored: (v: number) => set({ stored: v }),
    }))
);

const Map = ({ map_url }: { map_url: string }) => {
    return (
        <Image
            position={[0, -7.1, 0]}
            scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
            rotation={[-Math.PI / 2, 0, 0]}
            url={map_url}
        />
    );
};

// car city carpet 😎
// const MAP_SCALE = 100;
// const MAP_ASP = 0.833;
// function Map() {
//     return (
//         <>
//             <Image
//                 position={[0, -7.1, 0]}
//                 scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
//                 rotation={[-Math.PI / 2, 0, 0]}
//                 url="car-city.jpeg"
//             />
//         </>
//     );
// }
