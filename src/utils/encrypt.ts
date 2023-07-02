function encrypt(param: string) {
    const encrypted = Buffer.from(param, 'utf-8').toString('base64');

    return encrypted;
}

export { encrypt }