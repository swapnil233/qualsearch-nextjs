export const getSizeInBytes = (obj: any) => {
    const str = JSON.stringify(obj);
    const byteSize = Buffer.from(str, 'utf-8').length;
    return byteSize;
};