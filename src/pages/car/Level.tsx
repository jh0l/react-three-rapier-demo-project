import { Image, Box, Cylinder } from "@react-three/drei";
import { MAP_ASP, MAP_SCALE } from "./utils/useCanvasMap";
import { CarEntity } from "./CarEntity";
import { MeshStandardMaterial } from "three";
import { RigidBody } from "@react-three/rapier";
import { useJitRef } from "../../utils";

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
                color: "yellow",
                opacity: 0.9,
                transparent: true,
            })
    );
    return (
        <>
            {/* MAIN BOX */}
            <RigidBody>
                <Box
                    scale={[4.2, 5, 5.74]}
                    position={[-43.24, -5, -11.94]}
                    material={mat.current}
                />
                {/* BRIDGE */}
                <Box scale={[3.5, 0.5, 0.5]} position={[-39.5, -5, -13.4]}>
                    <meshStandardMaterial color="black" />
                </Box>
                <Box scale={[3.5, 0.5, 0.5]} position={[-39.5, -6, -13.4]}>
                    <meshStandardMaterial color="black" />
                </Box>
                {/* FRONT BOX */}
                <Box
                    scale={[2.7, 3.5, 4.1]}
                    position={[-36.85, -5.75, -13.4]}
                    material={mat.current}
                />
                {/* RESTBOX */}
                <Box scale={[0.5, 0.5, 1.12]} position={[-35, -7.1, -13.4]}>
                    <meshStandardMaterial color="orange" />
                </Box>
            </RigidBody>
            {/* PUSHY BOY */}
            <RigidBody
                enabledTranslations={[false, true, false]}
                lockRotations={true}
            >
                <Box scale={[0.5, 0.5, 4.1]} position={[-35, -1.1, -13.4]}>
                    <meshStandardMaterial color="gray" />
                </Box>
            </RigidBody>
            {/* CAR */}
            <RigidBody>
                <Box
                    scale={[2, 2, 4]}
                    position={[-43.96, -5.6, -6.7]}
                    material={mat.current}
                />
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-42.7, -6.5, -5.45]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-42.7, -6.5, -6.75]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-45.21, -6.5, -8.1]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-45.21, -6.5, -5.45]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-45.21, -6.5, -6.75]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
                <Cylinder
                    args={[0.45, 0.45, 0.45, 16]}
                    rotation={[0, 0, Math.PI / 2]}
                    position={[-42.7, -6.5, -8.1]}
                >
                    <meshStandardMaterial
                        color="gray"
                        transparent={true}
                        opacity={0.8}
                    />
                </Cylinder>
            </RigidBody>
        </>
    );
}

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
