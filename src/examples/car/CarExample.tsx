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
import { KeyMapType, useControls } from "./utils/useControls";
import { useHookmaMap } from "./utils/useHookmaMap";
import { Color, MeshStandardMaterial } from "three";

const WHEEL_VEL = 30;
const WHEEL_FAC = 20;
const WheelJoint = ({
    body,
    wheel,
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
    controls,
}: {
    body: RefObject<RapierRigidBody>;
    wheel: RefObject<RapierRigidBody>;
    bodyAnchor: Vector3Array;
    wheelAnchor: Vector3Array;
    rotationAxis: Vector3Array;
    controls: KeyMapType<boolean>;
}) => {
    const joint = useRevoluteJoint(body, wheel, [
        bodyAnchor,
        wheelAnchor,
        rotationAxis,
    ]);

    useFrame(() => {
        if (joint.current) {
            if (controls["forward"]) {
                joint.current.configureMotorVelocity(WHEEL_VEL, WHEEL_FAC);
            } else if (controls["backward"]) {
                joint.current.configureMotorVelocity(-WHEEL_VEL, WHEEL_FAC);
            } else {
                joint.current.configureMotorVelocity(0, WHEEL_FAC * 10);
            }
            if (controls["left"]) {
                joint.current.configureMotorVelocity(-WHEEL_VEL, WHEEL_FAC);
            }
        }
    });

    return null;
};

export const Car: Demo = () => {
    const bodyRef = useRef<RapierRigidBody>(null);
    const kb = useControls();
    const wheelPositions: [number, number, number][] = [
        // [-3, 0, 2],
        // [-3, 0, -2],
        [3, 0, 3],
        [3, 0, -3],
    ];
    const locBoxRef = useRef<THREE.Mesh>(null);
    const wheelRefs = useRef(
        wheelPositions.map(() => createRef<RapierRigidBody>())
    );
    const boxColorRef = useRef<MeshStandardMaterial>(null);
    const [compRef, imageRef, intersectionRef] = useHookmaMap();
    useFrame(() => {
        if (!boxColorRef.current || !intersectionRef.current?.color) return;
        const [r, g, b] = intersectionRef.current.color;
        boxColorRef.current.color.setRGB(r, g, b);
        if (intersectionRef.current?.intersections.length) {
            const { point } = intersectionRef.current.intersections[0];
            locBoxRef.current?.position.set(point.x, 1, point.z);
        }
    });
    return (
        <>
            <Box ref={locBoxRef} />
            <group position={[-38, -3, 10]} rotation={[0, -Math.PI / 1.5, 0]}>
                <RigidBody
                    colliders="cuboid"
                    ref={bodyRef}
                    type="dynamic"
                    canSleep={false}
                    friction={0}
                >
                    <Box
                        scale={[6, 1, 4]}
                        castShadow
                        receiveShadow
                        name="chassis"
                        ref={compRef}
                    >
                        <meshStandardMaterial color={"red"} ref={boxColorRef} />
                    </Box>
                </RigidBody>
                {wheelPositions.map((wheelPosition, index) => (
                    <RigidBody
                        position={wheelPosition}
                        colliders="hull"
                        type="dynamic"
                        key={index}
                        ref={wheelRefs.current[index]}
                        friction={1}
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
                        controls={kb.current}
                    />
                ))}
            </group>
            <Map ref={imageRef} />
        </>
    );
};

const MAP_SCALE = 55;
const MAP_ASP = 1.75;
const Map = forwardRef<any>((_, ref) => {
    return (
        <Image
            ref={ref}
            position={[0, -7.1, 0]}
            scale={[MAP_SCALE * MAP_ASP, MAP_SCALE]}
            rotation={[-Math.PI / 2, 0, 0]}
            url="map.png"
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
