//* ---- Importação bibliotecas
import fs from 'fs';
import path from 'path';
import { Router } from 'express';

//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { ConsoleMessage } from 'puppeteer';

const fsPromises = fs.promises;
const routerWebFiles = Router();

routerWebFiles.get('/pdfItem/:file', async (req, res) => {
    try {
        const { file } = req.params;
        const filePath = path.resolve(__dirname, '..', '..', '..', 'temp', 'reports');
        console.log(decodeURI(file))
        await fsPromises.stat(path.resolve(filePath, decodeURI(file)));
        let oldName = '';
        let newName = '';
        oldName = decodeURI(file);
        newName = oldName.split('__')[1];
        await fsPromises.rename(`${filePath}/${oldName}`, `${filePath}/${newName}`);

        res.download(path.resolve(filePath, newName));

        setTimeout(async () => {
            await fsPromises.rename(`${filePath}/${newName}`, `${filePath}/${oldName}`);
        },1000);

        setTimeout(async () => {
            await fsPromises.unlink(`${filePath}/${oldName}`);
        },2500);
        return
    } catch (error) {
        return res.status(404).send('<h1>Arquivo não encontrado</h1>');
    }
});

export { routerWebFiles }
