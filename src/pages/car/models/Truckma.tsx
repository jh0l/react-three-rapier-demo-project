/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import { useGLTF } from "@react-three/drei";
import {
    CuboidCollider,
    RigidBody,
    TrimeshCollider,
    Vector3Array,
} from "@react-three/rapier";
import { MeshStandardMaterial } from "three";

// positions of wheel meshes in Model
const WHEEL_POSITIONS: Vector3Array[] = [
    [-0.81, 0.05, 0],
    [-0.06, 0.05, 0],
    [-0.81, 0.05, 0.5],
    [-0.06, 0.05, 0.5],
    [-0.06, 0.05, 0.9],
    [-0.81, 0.05, 0.9],
];
const YELLOW_STD = new MeshStandardMaterial({
    color: "rgb(190, 150, 0)",
    opacity: 0.83,
    transparent: true,
});
export default function Model(props: any) {
    const { nodes } = useGLTF(TRUCKMA_URL) as any;
    return (
        <RigidBody
            {...props}
            rotation={[0, Math.PI, 0]}
            scale={3.5}
            colliders={false}
        >
            <group position={[0.44, -0.05, -0.24]}>
                {WHEEL_POSITIONS.map((position, index) => (
                    <CuboidCollider
                        key={index}
                        position={position}
                        args={[0.125, 0.065, 0.125]}
                        rotation={[0, 0, Math.PI / 2]}
                        friction={0}
                    >
                        <mesh
                            geometry={nodes.wheel.geometry}
                            material={nodes.wheel.material}
                        />
                    </CuboidCollider>
                ))}
            </group>
            <group position={[0, 0.06, 0.5]}>
                <CuboidCollider
                    args={[0.3, 0.035, 0.3]}
                    position={[0, 0.31, -0.53]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <mesh
                        geometry={nodes.front.geometry}
                        material={nodes.front.material}
                    />
                </CuboidCollider>
                <TrimeshCollider
                    args={[
                        nodes.tube.geometry.attributes.position.array,
                        nodes.tube.geometry.index?.array || [],
                    ]}
                    scale={[1, 1.3, 1]}
                    friction={0.1}
                    position={[0, 0.31, 0.11]}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <mesh
                        receiveShadow
                        geometry={nodes.tube.geometry}
                        material={YELLOW_STD}
                    />
                </TrimeshCollider>
            </group>
            <group position={[0, 0.22, -0.31]}>
                <TrimeshCollider
                    args={[
                        nodes.top.geometry.attributes.position.array,
                        nodes.top.geometry.index?.array || [],
                    ]}
                    position={[0, 0.17, -0.01]}
                    rotation={[-Math.PI / 4, 0, 0]}
                >
                    <mesh
                        geometry={nodes.top.geometry}
                        material={nodes.top.material}
                    />
                </TrimeshCollider>
                <mesh
                    geometry={nodes.bottom.geometry}
                    material={nodes.bottom.material}
                    position={[0, -0.17, 0.01]}
                />
            </group>
        </RigidBody>
    );
}
const TRUCKMA_URL = new URL(
    "../../../models/truckma.glb",
    import.meta.url
).toString();
useGLTF.preload(TRUCKMA_URL);