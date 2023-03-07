import { Box, Cylinder, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
    RapierRigidBody,
    RigidBody,
    useRevoluteJoint,
    Vector3Array,
} from "@react-three/rapier";
import { createRef, forwardRef, RefObject, useRef } from "react";
import { Demo } from "../../App";
import { ControlRes, useControls } from "./utils/useControls";
import { useHookmaMap } from "./utils/useHookmaMap";

const WHEEL_VEL = 10;
const WHEEL_FAC = 100;
const WheelJoint = ({
    body,
    wheel,
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
    controls,
    side,
}: {
    body: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: Vector3Array;
    wheelAnchor: Vector3Array;
    rotationAxis: Vector3Array;
    controls: RefObject<ControlRes>;
    side: "left" | "right";
}) => {
    const joint = useRevoluteJoint(body, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    ]);

    useFrame(() => {
        if (joint.current && controls.current) {
            joint.current.configureMotorVelocity(
                controls.current[side] * WHEEL_VEL,
                WHEEL_FAC
            );
        }
    });

    return null;
};

export const Car: Demo = () => {
    const bodyRef = useRef<RapierRigidBody>(null);
    const wheelPositions: [number, number, number][] = [
        [3, -1, 3],
        [3, -1, -3],
    ];
    const indexSides = ["left", "right"] as const;
    const floatyBoxesRef = useRef<RefObject<THREE.Mesh>[]>([
        createRef(),
        createRef(),
        createRef(),
        createRef(),
    ] as RefObject<THREE.Mesh>[]);
    const floatBoxesColorRef = useRef<RefObject<THREE.MeshPhysicalMaterial>[]>([
        createRef(),
        createRef(),
        createRef(),
        createRef(),
    ] as RefObject<THREE.MeshPhysicalMaterial>[]);
    const wheelRefs = useRef(
        wheelPositions.map(() => createRef<RapierRigidBody>())
    );
    const [imageRef, canvasRef] = useHookmaMap(floatyBoxesRef);
    const kb = useControls(canvasRef.current);
    useFrame(() => {
        const parentBox = floatyBoxesRef.current[0].current;
        if (!floatBoxesColorRef.current || !bodyRef.current || !parentBox)
            return;
        const { x, z } = bodyRef.current.nextTranslation();
        parentBox.position.set(x, -3, z);
        parentBox.setRotationFromQuaternion(
            //@ts-ignore
            bodyRef.current.nextRotation()
        );
        for (let i = 0; i < floatBoxesColorRef.current.length; i++) {
            if (canvasRef.current.color[i]) {
                const toDec = (x: number) => x / 255;
                const [r, g, b] = canvasRef.current.color[i].map(toDec);
                floatBoxesColorRef.current[i].current?.color.setRGB(r, g, b);
            }
        }
        if (canvasRef.current.color[0] && kb.current.sample) {
            const [r, g, b] = canvasRef.current.color[0];
            console.log(r, g, b);
            console.log(canvasRef.current.color);
            for (let floatyBox of floatyBoxesRef.current) {
                console.log(floatyBox.current?.position);
            }
        }
    });
    return (
        <>
            <Box ref={floatyBoxesRef.current[0]}>
                <meshPhysicalMaterial
                    color={"red"}
                    metalness={1}
                    reflectivity={0}
                    ref={floatBoxesColorRef.current[0]}
                />
                {floatyBoxesRef.current.slice(1).map((ref, index) => (
                    <Box
                        ref={ref}
                        key={index + 1}
                        position={[-(index + 1) * 2, 0, 0]}
                    >
                        <meshPhysicalMaterial
                            color={"red"}
                            metalness={1}
                            reflectivity={0}
                            ref={floatBoxesColorRef.current[index + 1]}
                        />
                    </Box>
                ))}
            </Box>
            <group position={[-38, -3, 10]} rotation={[0, -Math.PI / 1.5, 0]}>
                <RigidBody
                    colliders="cuboid"
                    ref={bodyRef}
                    type="dynamic"
                    canSleep={false}
                    friction={0}
                >
                    <Box
                        scale={[6.5, 1, 4]}
                        castShadow
                        receiveShadow
                        name="chassis"
                    >
                        <meshStandardMaterial color={"red"} />
                    </Box>
                </RigidBody>
                {wheelPositions.map((wheelPosition, index) => (
                    <RigidBody
                        position={wheelPosition}
                        colliders="hull"
                        type="dynamic"
                        key={index}
                        ref={wheelRefs.current[index]}
                        friction={2}
                    >
                        <Cylinder
                            rotation={[Math.PI / 2, 0, 0]}
                            args={[1, 1, 1, 32]}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial color={"grey"} />
                        </Cylinder>
                    </RigidBody>
                ))}
                {wheelPositions.map((wheelPosition, index) => (
                    <WheelJoint
                        key={index}
                        body={bodyRef}
                        wheel={wheelRefs.current[index]}
                        bodyAnchor={wheelPosition}
                        wheelAnchor={[0, 0, 0]}
                        rotationAxis={[0, 0, 1]}
                        controls={kb}
                        side={indexSides[index]}
                    />
                ))}
            </group>
            <Map ref={imageRef} map_url="map.png" />
        </>
    );
};

const MAP_SCALE = 55;
const MAP_ASP = 1.75;
const Map = forwardRef<any, { map_url: string }>(({ map_url }, ref) => {
    return (
        <Image
            ref={ref}
            position={[0, -7.1, 0]}
            scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
            rotation={[-Math.PI / 2, 0, 0]}
            url={map_url}
        />
    );
});

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
