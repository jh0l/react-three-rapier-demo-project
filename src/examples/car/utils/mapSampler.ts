let ctx: OffscreenCanvasRenderingContext2D | null;
const mapUrl = 'map.png';
function initMapSampler() {
    const map = new Image();
    map.src = mapUrl;
    ctx = new OffscreenCanvas(map.width, map.height).getContext('2d');
    ctx?.drawImage(map, 0, 0);
    if (!ctx) {
        throw new Error('Map not loaded');
    }
}

export function sampleMapReflect(x: number, y: number, diameter: number) {
    if (!ctx) initMapSampler();
    if (!ctx) throw new Error('Map not loaded');
    const imageData = ctx.getImageData(
        x - diameter / 2,
        y - diameter / 2,
        diameter,
        diameter
    );
    const data = imageData.data;
    // calculate average RGB value of the sample
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
    }
    // get reflectance of data.length pixels normalized
    const reflectance = (r + g + b) / (data.length * 3);
}
