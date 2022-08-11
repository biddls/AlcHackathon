
export function parseBoolean(str: string | undefined) {
    if (typeof(str) == "string") {
        return str.toLowerCase() === "true" || str === "1"
    }
    return false
}