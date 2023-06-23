export default function sanitizeFileName(filename: string) {
    let sanitizedFileName = filename
        .replace(/[^a-z0-9.-]/gi, "_")
        .replace(/_{2,}/g, "_")
        .replace(/\.{2,}/g, ".")
        .replace(/^\.+|\.+$|^_+|_+$/g, "")
        .toLowerCase();

    if (sanitizedFileName.length > 100) {
        const extension = sanitizedFileName.slice(
            ((sanitizedFileName.lastIndexOf(".") - 1) >>> 0) + 2
        );
        const name = sanitizedFileName.slice(0, 100 - extension.length - 1);
        sanitizedFileName = `${name}.${extension}`;
    }
    return sanitizedFileName;
}