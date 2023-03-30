import { Box, Cylinder, Html, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
    interactionGroups,
    RapierRigidBody,
    RigidBody,
    useRevoluteJoint,
    Vector3Array,
    CuboidCollider,
    BallCollider,
} from "@react-three/rapier";
import { RefObject, createRef, useEffect, useRef, useState } from "react";
import { useControls } from "./utils/useControls";
import { CanvasRes, useCanvasMap } from "./utils/useCanvasMap";
import * as THREE from "three";
import AutoTraceVehicle from "./utils/autoTraceVehicle";

export const WheelJoint = ({
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

// interface PokeyProps {
//     body: RefObject<RapierRigidBody>;
//     pokey: RefObject<RapierRigidBody>;
//     bodyAnchor: Vector3Array;
//     pokeyAnchor: Vector3Array;
//     rotAxis: Vector3Array;
// }

// export const PokeyJoint = ({body, pokey, bodyAnchor, pokeyAnchor, rotAxis}: PokeyProps) => {
//     const joint = usePrismaticJoint(body, pokey, [

//     ]);
//     return null;
// }

// technically the floor is a member of all collision groups by default, but we
// want to pretend it's in 0 just so BODY and WHEEL don't interact.
export const FLOOR_COL_GROUP = 0;
export const BODY_COL_GROUP = 1;
export const WHEEL_COL_GROUP = 2;

const WHEEL_VEL = 14;
const WHEEL_FAC = 90;

export function CarEntity({
    position = [-40, -3, 15],
}: {
    position?: [number, number, number];
}) {
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
        floatyBoxesRef.current[0].current?.getWorldPosition(STUPID_VEC);
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
        <group position={position} rotation={[0, -Math.PI / 1.5, 0]}>
            <RigidBody
                colliders={false}
                ref={bodyRef}
                type="dynamic"
                canSleep={false}
                friction={0}
                collisionGroups={interactionGroups(BODY_COL_GROUP, [
                    FLOOR_COL_GROUP,
                    BODY_COL_GROUP,
                ])}
            >
                <Box
                    ref={floatyBoxesRef.current[0]}
                    position={sensorPositions[0]}
                >
                    <group
                        position={[30, 10, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                    >
                        <PerspectiveCamera position={[0, 0, 10]} />
                    </group>
                    <Html>
                        {canvasRef.current && kbRef.current && (
                            <Readout
                                canvasRef={canvasRef.current}
                                controlRef={kbRef.current}
                                bodyRef={bodyRef}
                            />
                        )}
                        <div style={labelStyle} className="select-none">
                            0
                        </div>
                        {!auto && (
                            <div
                                style={goBtn}
                                className="select-none"
                                onClick={handleStart}
                            >
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
                                <div style={labelStyle} className="select-none">
                                    {index + 1}
                                </div>
                            </Html>
                            <meshStandardMaterial
                                color={"red"}
                                metalness={1}
                                ref={floatBoxesColorRef.current[index + 1]}
                            />
                        </Box>
                    ))}
                </Box>
                <Box scale={[8, 2, 8]} name="chassis">
                    <meshStandardMaterial color={"blue"} />
                </Box>
                <CuboidCollider args={[8, 2, 8]} scale={0.5} />
                <Cylinder
                    rotation={[Math.PI / 2, 0, 0]}
                    position={[-3, -0.3, -3.3]}
                    args={[WHEEL, WHEEL, WHEEL, 16]}
                />
                <BallCollider
                    friction={0.1}
                    args={[WHEEL]}
                    position={[-3, -0.3, 0]}
                />
                <Cylinder
                    rotation={[Math.PI / 2, 0, 0]}
                    position={[-3, -0.3, 3.3]}
                    args={[WHEEL, WHEEL, WHEEL, 16]}
                />
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
    );
}

export const labelStyle: React.CSSProperties = {
    color: "white",
    fontFamily: "monospace",
    textShadow: "0 0 2px black, 0 0 5px black, 0 0 7px black",
    position: "absolute",
    top: "-15px",
};

export const goBtn: React.CSSProperties = {
    position: "absolute",
    right: 15,
    bottom: 50,
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

interface ReadoutProps {
    canvasRef: CanvasRes;
    controlRef: AutoTraceVehicle;
    bodyRef: RefObject<RapierRigidBody>;
}
export function Readout({ canvasRef, controlRef, bodyRef }: ReadoutProps) {
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
    return <pre className="read-out select-none">{data}</pre>;
}
