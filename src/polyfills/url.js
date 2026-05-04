const url = require("url");

// Add missing fileURLToPath if strictly needed, or just re-export
// The error said "export 'fileURLToPath' ... was not found"
// So we need to add it.

function fileURLToPath(fileURL) {
    // Very basic shim for fileURLToPath if not present
    // This might need to be more robust depending on usage, but for simple cases:
    let path = typeof fileURL === 'string' ? fileURL : fileURL.toString();
    if (path.startsWith('file://')) {
        path = path.slice(7);
    }
    return path;
}

module.exports = {
    ...url,
    fileURLToPath: url.fileURLToPath || fileURLToPath,
};
