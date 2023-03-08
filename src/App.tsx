import {
    Box,
    Environment,
    OrbitControls,
    PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Debug, Physics, RigidBody } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import {
    createContext,
    ReactNode,
    Suspense,
    useContext,
    useState,
    StrictMode,
} from "react";

import { Car } from "./examples/car/CarExample";

const demoContext = createContext<{
    setDebug?(f: boolean): void;
    setPaused?(f: boolean): void;
    setCameraEnabled?(f: boolean): void;
}>({});

export const useDemo = () => useContext(demoContext);

const ToggleButton = ({
    label,
    value,
    onClick,
}: {
    label: string;
    value: boolean;
    onClick(): void;
}) => (
    <button
        style={{
            background: value ? "red" : "transparent",
            border: "2px solid red",
            color: value ? "white" : "red",
            borderRadius: 4,
        }}
        onClick={onClick}
    >
        {label}
    </button>
);

export interface Demo {
    (props: { children?: ReactNode }): JSX.Element;
}

const Floor = () => {
    return (
        <RigidBody type="fixed" colliders="cuboid">
            <Box
                position={[0, -12, 0]}
                scale={[200, 10, 200]}
                rotation={[0, 0, 0]}
                receiveShadow
            >
                <shadowMaterial opacity={0.2} />
            </Box>
        </RigidBody>
    );
};

export const App = () => {
    const [debug, setDebug] = useState<boolean>(true);
    const [perf, setPerf] = useState<boolean>(false);
    const [paused, setPaused] = useState<boolean>(false);
    const [physicsKey, setPhysicsKey] = useState<number>(0);
    const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

    const updatePhysicsKey = () => {
        setPhysicsKey((current) => current + 1);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "linear-gradient(blue, white)",
                fontFamily: "sans-serif",
            }}
        >
            <Suspense fallback="Loading...">
                <Canvas shadows>
                    <PerspectiveCamera position={[0, 70, 0]} makeDefault />
                    <StrictMode>
                        <Physics
                            paused={paused}
                            key={physicsKey}
                            gravity={[0, -200, 0]}
                        >
                            <directionalLight
                                castShadow
                                position={[10, 10, 10]}
                                shadow-camera-bottom={-40}
                                shadow-camera-top={40}
                                shadow-camera-left={-40}
                                shadow-camera-right={40}
                                shadow-mapSize-width={1024}
                                shadow-bias={-0.0001}
                            />
                            <Environment preset="city" />

                            <OrbitControls enabled={cameraEnabled} />

                            <demoContext.Provider
                                value={{
                                    setDebug,
                                    setPaused,
                                    setCameraEnabled,
                                }}
                            >
                                <Car />
                            </demoContext.Provider>

                            <Floor />

                            {debug && <Debug />}
                            {perf && <Perf />}
                        </Physics>
                    </StrictMode>
                </Canvas>
            </Suspense>

            <div
                style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    maxWidth: 600,
                }}
            >
                <ToggleButton
                    label="Debug"
                    value={debug}
                    onClick={() => setDebug((v) => !v)}
                />
                <ToggleButton
                    label="Perf"
                    value={perf}
                    onClick={() => setPerf((v) => !v)}
                />
                <ToggleButton
                    label="Paused"
                    value={paused}
                    onClick={() => setPaused((v) => !v)}
                />
                <ToggleButton
                    label="Reset"
                    value={false}
                    onClick={updatePhysicsKey}
                />
            </div>
        </div>
    );
};
