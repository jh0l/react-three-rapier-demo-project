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
import { useJitRef } from "../../utils";
import { useRef } from "react";
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

function FuelStation() {
    const mat = useJitRef(
        () =>
            new MeshStandardMaterial({
                color: "rgb(190, 150, 0)",
                // opacity: 0.9,
                // transparent: true,
            })
    );
    const grayMat = useJitRef(
        () =>
            new MeshStandardMaterial({
                color: "gray",
                opacity: 0.9,
                transparent: true,
            })
    );
    return (
        <group position={[-43.24, -5, -11.94]}>
            {/* MAIN BOX */}
            <RigidBody lockTranslations={true}>
                <Box
                    scale={[4.2, 5, 5.74]}
                    material={mat.current}
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
                    material={mat.current}
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
            <PushyBoy mat={grayMat} />
            <Car mat={mat} grayMat={grayMat} />
            <UnitStack />
        </group>
    );
}

const UnitStack = () => {
    const { stored, units } = useFuelStationStore();
    const mat = useJitRef(
        () =>
            new MeshPhysicalMaterial({
                color: "hotpink",
                // @ts-ignore
                iridescence: 1,
                iridescenceIOR: 1,
                // iridescenceThicknessRange={[0, 1400]}
                roughness: 1,
                clearcoat: 0.5,
                metalness: 0.75,
            })
    );
    return (
        <>
            {Array(stored)
                .fill(0)
                .map((_, i) => (
                    <Cylinder
                        args={[2 / 3, 2 / 3, 1, 10]}
                        castShadow
                        position={[0, 3.1 + i * 1.07, 0]}
                        material={mat.current}
                        key={i + 1}
                    />
                ))}
            {units.map((id) => (
                <RigidBody>
                    <Cylinder
                        args={[2 / 3, 2 / 3, 1, 10]}
                        position={[-0.75, 3.1, 5]}
                        material={mat.current}
                        key={id}
                    />
                </RigidBody>
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

type MatRef = { current: MeshStandardMaterial };

const Car = ({ mat, grayMat }: { mat: MatRef; grayMat: MatRef }) => {
    const torus = useJitRef(() => new TorusGeometry(1.2, 0.3, 4, 4));
    console.log(torus);
    return (
        <group position={[-0.72, 1, 5.9]} scale={1.2}>
            <RigidBody colliders={false}>
                <CuboidCollider
                    args={[2, 2, 3]}
                    scale={0.5}
                    position={[0, 0, -0.81]}
                />
                <Box
                    scale={[2, 2, 3]}
                    position={[0, 0, -0.81]}
                    material={mat.current}
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
                    material={mat.current}
                    position={[0, 0, 1.56]}
                    rotation={[-Math.PI / 3.2, 0, Math.PI / 4]}
                />
                {WHEEL_POS.map((pos, i) => (
                    <Cylinder
                        args={WHEEL_ARGS}
                        rotation={WHEEL_ROT}
                        position={pos}
                        material={grayMat.current}
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

const PushyBoy = ({ mat }: { mat: MatRef }) => {
    const ref = useRef<RapierRigidBody>(null);
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
                material={mat.current}
            ></Box>
        </RigidBody>
    );
};

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
