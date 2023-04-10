import { Image, Box, Cylinder } from "@react-three/drei";
import { MAP_ASP, MAP_SCALE } from "./utils/useCanvasMap";
import { CarEntity } from "./CarEntity";
import {
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    TorusGeometry,
} from "three";
import {
    CuboidCollider,
    RapierRigidBody,
    RigidBody,
    TrimeshCollider,
} from "@react-three/rapier";
import { RefObject, forwardRef, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
            <RigidBody type="fixed">
                <Box
                    scale={[4.2, 5, 5.74]}
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
                <Box scale={[0.5, 0.5, 1.12]} position={[8.24, -1.8, -1.46]}>
                    <meshStandardMaterial color="orange" />
                </Box>
                {/* TOPBOX (limits PUSHY BOY) */}
                <Box scale={[0.5, 0.5, 1.12]} position={[8.24, 0.7, -1.46]}>
                    <meshStandardMaterial color="orange" />
                </Box>
            </RigidBody>
            {/* PUSHY BOY */}
            <PushyBoy ref={pushyRef} />
            <UnitStack pushyRef={pushyRef} />
            <Car />
        </group>
    );
}
type Pos = [number, number, number];
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
const FuelUnit = ({ pos }: { pos: Pos }) => (
    <RigidBody gravityScale={0.1}>
        <Cylinder
            args={[2 / 3, 2 / 3, 1, 10]}
            scale={0.8}
            castShadow
            position={pos}
            material={HOTPINK_PHYS}
        />
    </RigidBody>
);

const HOLDER_RAD = 0.65;
const UnitStack = ({ pushyRef }: { pushyRef: RefObject<RapierRigidBody> }) => {
    const { stored, units } = useFuelStationStore();
    const pusherRef = useRef<RapierRigidBody>(null);
    useFrame(() => {
        if (pusherRef.current && pushyRef && pushyRef.current) {
            // const vec = pushyRef.current.translation();
            const trans = pusherRef.current.translation();
            trans.z += 0.01;
            pusherRef.current.setTranslation(trans, false);
        }
    });
    return (
        <>
            <group position={[0, 3, 2]}>
                {/* holder */}
                <RigidBody type="fixed">
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[HOLDER_RAD, 2.1, 0]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[-HOLDER_RAD, 2.1, 0]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[0, 3.1, HOLDER_RAD]}
                        material={YELLOW_STD}
                    />
                    <Box
                        scale={[0.2, 5, 0.2]}
                        position={[0, 3.1, -HOLDER_RAD]}
                        material={YELLOW_STD}
                    />
                </RigidBody>
                {/* pusher */}
                <RigidBody ref={pusherRef} type="fixed">
                    <Box
                        scale={[1, 2 / 3, 0.85]}
                        position={[0, -0.1, -1]}
                        material={GRAY_STD}
                    />
                </RigidBody>
                {Array(stored)
                    .fill(0)
                    .map((_, i) => (
                        <FuelUnit pos={[0, i * 1.01, 0]} key={i + 1} />
                    ))}
            </group>
            {units.map((id) => (
                <FuelUnit pos={[-0.75, 3.1, 5]} key={id} />
            ))}
        </>
    );
};

const WHEEL_POS: [number, number, number][] = [
    [1.26, -0.9, 1.25],
    [1.26, -0.9, -0.05],
    [-1.25, -0.9, -1.4],
    [-1.25, -0.9, 1.25],
    [-1.25, -0.9, -0.05],
    [1.26, -0.9, -1.4],
];

const WHEEL_ARGS: [number, number, number, number] = [0.45, 0.45, 0.45, 16];

const WHEEL_ROT: [number, number, number] = [0, 0, Math.PI / 2];

const Car = () => {
    const torus = useRef(new TorusGeometry(1.2, 0.3, 4, 4));
    return (
        <group>
            <RigidBody colliders={false} position={[-0.72, 1, 5.9]} scale={1.2}>
                <CuboidCollider
                    args={[2, 2, 3]}
                    scale={0.5}
                    position={[0, 0, -0.81]}
                />
                <Box
                    scale={[2, 2, 3]}
                    position={[0, 0, -0.81]}
                    material={YELLOW_STD}
                />
                <TrimeshCollider
                    args={[
                        // @ts-ignore
                        torus.current.attributes.position.array,
                        // @ts-ignore
                        torus.current.index.array,
                    ]}
                    position={[0, 0, 1.56]}
                    rotation={[-Math.PI / 3.2, 0, Math.PI / 4]}
                />
                <mesh
                    geometry={torus.current}
                    material={YELLOW_STD}
                    position={[0, 0, 1.56]}
                    rotation={[-Math.PI / 3.2, 0, Math.PI / 4]}
                />
                {WHEEL_POS.map((pos, i) => (
                    <Cylinder
                        args={WHEEL_ARGS}
                        rotation={WHEEL_ROT}
                        position={pos}
                        material={GRAY_STD}
                        key={i + 1}
                    />
                ))}
                <CuboidCollider
                    args={[0.45, 0.9, 3.55]}
                    scale={0.5}
                    position={[1.25, -0.9, -0.07]}
                />
                <CuboidCollider
                    args={[0.45, 0.9, 3.55]}
                    scale={0.5}
                    position={[-1.25, -0.9, -0.07]}
                />
            </RigidBody>
        </group>
    );
};

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
        stored: 5,
        units: ["bing"],
        setDropped: (v: boolean) => set({ isDropped: v }),
        setLifted: (v: boolean) => set({ isLifted: v }),
        setStored: (v: number) => set({ stored: v }),
    }))
);

const PushyBoy = forwardRef<RapierRigidBody>((_, ref) => {
    useFrame(() => {});
    return (
        <RigidBody
            enabledTranslations={[false, true, false]}
            lockRotations={true}
            ref={ref}
        >
            <Box
                scale={[0.5, 0.5, 4.1]}
                position={[8.24, -0.6, -1.46]}
                material={GRAY_STD}
            ></Box>
        </RigidBody>
    );
});

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
