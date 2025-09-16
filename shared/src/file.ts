export async function fileToBase64(file: File, withMime: boolean = false): Promise<string> {
    return new Promise(async (resolve) => {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }
        const base64 = btoa(binary);
        resolve(withMime ? `data:${file.type};base64,${base64}` : base64);
    });
}
