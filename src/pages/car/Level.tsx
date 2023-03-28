import { Image, Box } from "@react-three/drei";
import { MAP_ASP, MAP_SCALE } from "./utils/useCanvasMap";
import { CarEntity } from "./CarEntity";

export default function Level() {
    return (
        <>
            <CarEntity position={[-40, -3, 15]} />
            <Map map_url="map.png" />
            <FuelStation />
        </>
    );
}

function FuelStation() {
    return (
        <>
            <Box scale={[4, 5, 6]}  position={[-43, -5, -12]}>
                <meshStandardMaterial color="yellow" />
            </Box>
            <Box scale={[3, 4, 4]}  position={[-37, -5, -14]}>
                <meshStandardMaterial color="yellow" />
            </Box>
        </>
    )
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
