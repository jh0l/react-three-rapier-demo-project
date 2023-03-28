import { Image } from "@react-three/drei";
import { Demo } from "../../App";
import { MAP_ASP, MAP_SCALE } from "./utils/useCanvasMap";
import { CarEntity } from "./CarEntity";

export const Car: Demo = () => {
    return (
        <>
            <CarEntity position={[-40, -3, 15]} />
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
