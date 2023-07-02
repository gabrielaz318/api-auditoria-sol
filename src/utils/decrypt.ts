function decrypt(param: string) {
    const decrypted = Buffer.from(param, 'base64').toString('utf-8');

    return decrypted;
}

export { decrypt }