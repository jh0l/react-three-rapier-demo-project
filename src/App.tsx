import {
    Box,
    Environment,
    OrthographicCamera,
    // PerspectiveCamera,
    OrbitControls,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Debug, Physics, RigidBody, Vector3Array } from "@react-three/rapier";
import { Perf } from "r3f-perf";
import {
    Suspense,
    StrictMode,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import Level from "./pages/car/Level";
// import OnScreenControls from "./pages/car/components/OnScreenControls/OnScreenControls";
import BlocklyEditor from "./BlocklyEditor/BlocklyEditor";

interface AppState {
    debug: boolean;
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
    devtools((set) => ({
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
    }))
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
        className="select-none px-2"
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
/*
{
    33.99355661923482,
    55.6466792737373,
    26.384645127537574
}
    -1.0842498521952741,
    0.8474920950984738,
    0.9562984074406269,
*/
// car location
const CAM_LOC: Vector3Array = [
    33.99355661923482, 55.6466792737373, 26.384645127537574,
];
const TARG_LOC: Vector3Array = [-43.24, -5, -0.94];
const CAM_ZOOM = 13;
/* default camera location /
const CAM_LOC: Vector3Array = [20, 70, 40];
const TARG_LOC: Vector3Array = [-20, 0, -5];
const CAM_ZOOM = 20;
*/
export const App = () => {
    const camRef = useRef<typeof OrthographicCamera>();
    useLayoutEffect(() => {
        setTimeout(() => console.log(camRef), 1000);
    }, []);

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
    useEffect(() => {
        setTimeout(() => resetPhysics(), 1000);
    }, []);
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "linear-gradient(blue, white)",
                fontFamily: "sans-serif",
            }}
        >
            <div className="w-full h-1/2">
                <Suspense fallback={<Loading />}>
                    <Canvas shadows>
                        <OrbitControls
                            enabled={cameraEnabled}
                            target={TARG_LOC}
                        />
                        <OrthographicCamera
                            ref={camRef}
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
            </div>
            <BlocklyEditor />
            <div className="togglebtn_group">
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
            </div>
            {/* <OnScreenControls /> */}
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
