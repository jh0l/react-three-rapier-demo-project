import {
    Box,
    Environment,
    // OrthographicCamera,
    PerspectiveCamera,
    OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Debug, Physics, RigidBody } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import {
    createContext,
    Suspense,
    useContext,
    useState,
    StrictMode,
} from "react";

import Level from "./pages/car/Level";
import OnScreenControls from "./pages/car/components/OnScreenControls/OnScreenControls";

const appContext = createContext<{
    setDebug?(f: boolean): void;
    debug?: boolean;
    setPaused?: React.Dispatch<React.SetStateAction<boolean>>;
    setCameraEnabled?(f: boolean): void;
    resetPhysics?(): void;
    paused?: boolean;
}>({});

export const useAppContext = () => useContext(appContext);

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
        className="select-none"
        onClick={onClick}
    >
        {label}
    </button>
);

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

    const resetPhysics = () => {
        setPhysicsKey((current) => current + 1);
    };

    const context = {
        setDebug,
        debug,
        setPaused,
        setCameraEnabled,
        resetPhysics,
        paused,
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
            <appContext.Provider value={context}>
                <Suspense fallback={<Loading />}>
                    <Canvas>
                        <OrbitControls
                            enabled={cameraEnabled}
                            target={[-40, 0, -6]}
                        />
                        <PerspectiveCamera
                            position={[-30, 30, -5]}
                            makeDefault
                        />
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

                                <Level />

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
                        onClick={resetPhysics}
                    />
                    <ToggleButton
                        label="Home"
                        value={false}
                        onClick={() => {}}
                    />
                </div>
                <OnScreenControls />
            </appContext.Provider>
        </div>
    );
};

const Loading = () => {
    return (
        <div className="flex-col font-mono w-full h-full flex items-center justify-center text-white text-xl">
            <div className="flex items-center justify-center">
                loading simulation
                <div className="flex items-center justify-center">
                    <div className="font-mono ml-4 animate-spin text-5xl origin-[50%_20.7px]">
                        📀
                    </div>
                    <div className="-ml-5 text-5xl z-10 rotate-6">/</div>
                </div>
            </div>
            <div className="w-72">
                <div className="loading origin-left text-3xl font-bold">_</div>
            </div>
        </div>
    );
};
