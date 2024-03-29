import { Box, Cylinder, Html, Image } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
    interactionGroups,
    RapierRigidBody,
    RigidBody,
    useRevoluteJoint,
    Vector3Array,
} from "@react-three/rapier";
import { createRef, RefObject, useEffect, useRef, useState } from "react";
import { Demo } from "../../App";
import { useControls } from "./utils/useControls";
import {
    MAP_ASP,
    MAP_SCALE,
    useCanvasMap,
    CanvasRes as CanvasRes,
} from "./utils/useCanvasMap";
import * as THREE from "three";
import AutoTraceVehicle from "./utils/autoTraceVehicle";

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
    controls: RefObject<AutoTraceVehicle>;
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
                controls.current.state[side] * WHEEL_VEL,
                WHEEL_FAC
            );
        }
    });

    return null;
};

// technically the floor is a member of all collision groups by default, but we
// want to pretend it's in 0 just so BODY and WHEEL don't interact.
const FLOOR_COL_GROUP = 0;
const BODY_COL_GROUP = 1;
const WHEEL_COL_GROUP = 2;

const WHEEL_VEL = 14;
const WHEEL_FAC = 90;
export const Car: Demo = () => {
    const bodyRef = useRef<RapierRigidBody>(null);
    const wheelPositions: [number, number, number][] = [
        [3, -0.3, 3.3],
        [3, -0.3, -3.3],
    ];
    const sensorPositions: [number, number, number][] = [
        [-2.6, 2, 0],
        [1, 0, 1],
        [2, 0, 0],
        [1, 0, -1],
    ];
    const WHEEL = 1.35;
    const indexSides = ["left", "right"] as const;
    const floatyBoxesRef = useRef(
        sensorPositions.map(() => createRef<THREE.Mesh>())
    );
    const floatBoxesColorRef = useRef(
        sensorPositions.map(() => createRef<THREE.MeshPhysicalMaterial>())
    );
    const wheelRefs = useRef(
        wheelPositions.map(() => createRef<RapierRigidBody>())
    );
    const STUPID_VEC = new THREE.Vector3();
    const [canvasRef] = useCanvasMap(floatyBoxesRef);
    const [kbRef, [{ auto }, setKbState]] = useControls(canvasRef);
    const handleStart = () => setKbState({ auto: true });
    useFrame(() => {
        const parentBox = floatyBoxesRef.current[0].current;
        if (!floatBoxesColorRef.current || !bodyRef.current || !parentBox)
            return;
        for (let i = 0; i < floatBoxesColorRef.current.length; i++) {
            if (canvasRef.current.luminance) {
                const v = canvasRef.current.luminance.get(i);
                floatBoxesColorRef.current[i].current?.color.setRGB(v, v, v);
            }
        }
        if (canvasRef.current.luminance.get(0) && kbRef.current.state.sample) {
            const v = canvasRef.current.luminance;
            console.log(v);
            console.log(canvasRef.current.luminance);
            for (let i = 0; i < floatyBoxesRef.current.length; i++) {
                console.log(i);
                const floatyBox = floatyBoxesRef.current[i];
                console.log(floatyBox.current?.getWorldPosition(STUPID_VEC));
                const vector = canvasRef.current.vectors[i];
                console.log(vector);
            }
        }
    });
    return (
        <>
            <group position={[-40, -3, 15]} rotation={[0, -Math.PI / 1.5, 0]}>
                <RigidBody
                    colliders="cuboid"
                    ref={bodyRef}
                    type="dynamic"
                    canSleep={false}
                    friction={0}
                    collisionGroups={interactionGroups(BODY_COL_GROUP, [
                        FLOOR_COL_GROUP,
                    ])}
                >
                    <Box
                        ref={floatyBoxesRef.current[0]}
                        position={sensorPositions[0]}
                    >
                        <Html>
                            {canvasRef.current && kbRef.current && (
                                <Readout
                                    canvasRef={canvasRef.current}
                                    controlRef={kbRef.current}
                                    bodyRef={bodyRef}
                                />
                            )}
                            <div style={labelStyle}>0</div>
                            {!auto && (
                                <div style={goBtn} onClick={handleStart}>
                                    Start
                                </div>
                            )}
                        </Html>
                        <meshStandardMaterial
                            color={"red"}
                            ref={floatBoxesColorRef.current[0]}
                        />
                        {floatyBoxesRef.current.slice(1).map((ref, index) => (
                            <Box
                                ref={ref}
                                key={index + 1}
                                position={sensorPositions[index + 1]}
                            >
                                <Html>
                                    <div style={labelStyle}>{index + 1}</div>
                                </Html>
                                <meshStandardMaterial
                                    color={"red"}
                                    metalness={1}
                                    ref={floatBoxesColorRef.current[index + 1]}
                                />
                            </Box>
                        ))}
                    </Box>
                    <Box scale={[12, 2, 8]} name="chassis">
                        <meshStandardMaterial color={"blue"} />
                    </Box>
                </RigidBody>
                {wheelPositions.map((wheelPosition, index) => (
                    <RigidBody
                        position={wheelPosition}
                        colliders="ball"
                        type="dynamic"
                        key={index}
                        ref={wheelRefs.current[index]}
                        friction={2}
                        collisionGroups={interactionGroups(WHEEL_COL_GROUP, [
                            FLOOR_COL_GROUP,
                        ])}
                    >
                        <Cylinder
                            rotation={[Math.PI / 2, 0, 0]}
                            args={[WHEEL, WHEEL, WHEEL, 16]}
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
                        controls={kbRef}
                        side={indexSides[index]}
                    />
                ))}
            </group>
            <Map map_url="map.png" />
        </>
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

const labelStyle: React.CSSProperties = {
    color: "white",
    fontFamily: "monospace",
    textShadow: "0 0 2px black, 0 0 5px black, 0 0 7px black",
    position: "absolute",
    top: "-15px",
};

const goBtn: React.CSSProperties = {
    position: "absolute",
    left: 50,
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    padding: "8px 16px",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
    fontSize: "16px",
    margin: "4px 2px",
    cursor: "pointer",
    borderRadius: "5px",
};

const readOutStyle: React.CSSProperties = {
    ...labelStyle,
    position: "absolute",
    left: "-10vw",
    top: "-20vh",
    width: "100px",
    height: "100px",
    fontFamily: "monospace",
};

interface ReadoutProps {
    canvasRef: CanvasRes;
    controlRef: AutoTraceVehicle;
    bodyRef: RefObject<RapierRigidBody>;
}
function Readout({ canvasRef, controlRef, bodyRef }: ReadoutProps) {
    const [data, setData] = useState("");
    const ref = useRef<number>(0);
    useEffect(() => {
        ref.current = setInterval(() => {
            if (controlRef && bodyRef.current) {
                let { x, y, z } = bodyRef.current.nextTranslation();
                let [xs, ys, zs] = [x, y, z].map((v) =>
                    v.toFixed(1).padEnd(5, " ")
                );
                const loc = `x:${xs} y:${ys} z:${zs}`;
                const [LW, RW] = [
                    controlRef.state.left,
                    controlRef.state.right,
                ].map((x) => String(x).padEnd(4, " "));
                let LR = `LW:${LW} RW:${RW}`;
                const [T, L, B, R] = canvasRef.luminance.map((x) =>
                    String(x).padEnd(4, " ")
                );
                const LUM = `T:${T} L:${L}\nB:${B} R:${R}`;
                const frame = `F: ${controlRef.state.tick} `;
                const cmd = `${controlRef.state.cmds.command.name}:${controlRef.state.cmds.idx}`;
                const arr = [loc, LR, LUM, frame + cmd];
                setData(arr.join("\n"));
            }
        }, 200);
        return () => {
            ref.current && clearInterval(ref.current);
        };
    }, []);
    return <pre style={readOutStyle}>{data}</pre>;
}

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
