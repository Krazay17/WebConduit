export function getProperty(obj) {
    if (!obj) return;
    const props = obj.properties?.reduce((acc, prop) => {
        acc[prop.name] = prop.value;
        return acc;
    }, {});
    return props;
}

export function changeCollision(object, x, y, xOffset = 0, yOffset = 0) {
    if (!object.body) return;
    object.body.setSize(x, y);
    object.body.setOffset(
        ((object.width - x) / 2) + xOffset,
        ((object.height - y) / 2) + yOffset
    );
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function mapRangeClamped(value, inMin, inMax, outMin, outMax) {
    if (inMin === inMax) return outMin; // Avoid divide by zero

    // Normalize input range to 0–1
    let t = (value - inMin) / (inMax - inMin);

    // Clamp the normalized value
    t = Math.max(0, Math.min(1, t));

    // Remap to output range
    return outMin + (outMax - outMin) * t;
}