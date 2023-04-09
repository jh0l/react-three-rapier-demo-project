import {
    Box,
    Environment,
    OrthographicCamera,
    // PerspectiveCamera,
    OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Debug, Physics, RigidBody } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import { Suspense, StrictMode } from "react";
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

import Level from "./pages/car/Level";
import OnScreenControls from "./pages/car/components/OnScreenControls/OnScreenControls";

interface AppState {
    debug: true | false;
    altDebug: () => void;
    paused: boolean;
    altPaused: () => void;
    cameraEnabled: boolean;
    setCameraEnabled: (f: boolean) => void;
    perf: boolean;
    altPerf: () => void;
    physicsKey: number;
    resetPhysics: () => void;
}

export const useAppStore = create<AppState>()(
    devtools(
        persist(
            (set) => ({
                debug: true,
                altDebug: () => set((state) => ({ debug: !state.debug })),
                paused: false,
                altPaused: () => set((state) => ({ paused: !state.paused })),
                cameraEnabled: true,
                setCameraEnabled: (f) => set({ cameraEnabled: f }),
                perf: true,
                altPerf: () => set((state) => ({ perf: !state.perf })),
                physicsKey: 0,
                resetPhysics: () =>
                    set((state) => ({ physicsKey: state.physicsKey + 1 })),
            }),
            {
                name: "robosim-storage", // unique name
                storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
            }
        )
    )
);

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
            >
                <shadowMaterial opacity={0.2} />
            </Box>
        </RigidBody>
    );
};
const CAM_LOC: [number, number, number] = [20, 70, 40];
const TARG_LOC: [number, number, number] = [-20, 0, -5];
const CAM_ZOOM = 20;
export const App = () => {
    const {
        cameraEnabled,
        debug,
        altDebug,
        paused,
        altPaused,
        physicsKey,
        perf,
        altPerf,
        resetPhysics,
    } = useAppStore();
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "linear-gradient(blue, white)",
                fontFamily: "sans-serif",
            }}
        >
            <Suspense fallback={<Loading />}>
                <Canvas shadows>
                    <OrbitControls enabled={cameraEnabled} target={TARG_LOC} />
                    <OrthographicCamera
                        position={CAM_LOC}
                        zoom={CAM_ZOOM}
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
                            <Environment
                                // preset="city"
                                files="./potsdamer_platz_1k.hdr"
                            />

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
                <ToggleButton label="Debug" value={debug} onClick={altDebug} />
                <ToggleButton
                    label="Paused"
                    value={paused}
                    onClick={altPaused}
                />
                <ToggleButton label="Perf" value={perf} onClick={altPerf} />
                <ToggleButton
                    label="Reset"
                    value={false}
                    onClick={resetPhysics}
                />
                <ToggleButton label="Home" value={false} onClick={() => {}} />
            </div>
            <OnScreenControls />
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
