//* ---- Importação bibliotecas
import path from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';
import { Router } from 'express';
import { v4 as uuidV4 } from 'uuid';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { IDeleteItem, IGetItems, IPatchComment, IPatchItem, IPatchPicture, IPostItems } from './dto/IItems';

const routerAppItems = Router();


routerAppItems.get('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { recordId } = query as IGetItems;

        if(recordId == undefined) {
            return res.status(400).json({ code: 2, message: 'Parâmetro não enviado.' });
        }

        const recordsDB = await dbMysql.select('registro', 'comentario', 'foto', 'dh_criacao').into('ocorrencias');

        const recordsDBFormatted = recordsDB.map(item => ({
            picture: item.foto,
            record: item.registro,
            comment: item.comentario,
            createdAt: item.creatd_at,
        }));

        return res.send(recordsDBFormatted);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 1, message: 'Erro interno.' });
    }
});

routerAppItems.post('/', async (req, res) => {
    try {
        const { recordId, comment, picture, createdAt } = req.body as IPostItems;

        if(createdAt == undefined || recordId == undefined || comment == undefined || picture == undefined) {
            return res.status(400).json({ code: 4, message: 'Parâmetros não enviados.' });
        }

        if(picture.indexOf('data:image/jpg;base64,') == -1) {
            return res.status(400).json({ code: 6, message: 'Foto informada esta inválida.' });
        }

        const fileName = uuidV4()+'.jpg';
        const fileNameNew = uuidV4()+'.jpg';
        const pathFile = path.resolve(__dirname, '..', '..', '..', 'temp', 'images', fileName);
        const pathFileNew = path.resolve(__dirname, '..', '..', '..', 'temp', 'images', fileNameNew);
        
        const bufferData = Buffer.from(picture.replace('data:image/jpg;base64,', ''), 'base64');
        await fs.writeFile(pathFile, bufferData);
        
        const dimen1 = await sharp(pathFile).metadata();
        let dimen2 = {} as any;

        let newPicture = '';
        if(dimen1 != undefined) {
            await new Promise((resolve) => {
                sharp(pathFile)
                .resize(720, 1080, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true
                })
                .withMetadata()
                .toFile(pathFileNew, async () => {
                    await fs.unlink(pathFile);
                    dimen2 = await sharp(pathFileNew).metadata();
                    resolve('');
                });
            });

            await new Promise((resolve) => setTimeout(() => resolve(''), 1000));

            const newImageBase64 = await new Promise((resolve) => {
                if(dimen2?.orientation! == 6) {
                    sharp(pathFileNew)
                    .rotate(90)
                    .toBuffer()
                    .then(async (buffer: any) => {
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    }); 
                } 
                else if(dimen2?.orientation! == 5) {
                    sharp(pathFileNew)
                    .rotate(-90)
                    .toBuffer()
                    .then(async (buffer: any) => {
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    }); 
                } else {
                    sharp(pathFileNew)
                    .withMetadata()
                    .toBuffer()
                    .then(async (buffer: any) => {
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    });
                }
            });
            
            newPicture = 'data:image/jpg;base64,'+newImageBase64;
        } else {
            newPicture = picture;
        }
        
        const [recordIdDB] = await dbMysql.insert({ registro: recordId, comentario: comment, foto: newPicture, dh_criacao: new Date(createdAt) }).into('ocorrencias');

        return res.status(202).json({ id: recordIdDB, created: true });
    } catch (error: any) {
        if(error?.code == 'ER_NO_REFERENCED_ROW_2') {
            return res.status(500).json({ code: 8, message: 'Não foi possível publicar este item pois o registro não existe mais.\n\nCausas do erro:\n\n- Registro deletado pelo site;\n- Registro deletado em outro celular.\n\nVocê pode deletar este registro e iniciar outro.' });
        }
        return res.status(500).json({ code: 5, message: 'Erro interno.' });
    }
});

routerAppItems.patch('/', async (req, res) => {
    try {
        const { itemId, comment, picture } = req.body as IPatchItem;

        if(itemId == undefined || comment == undefined || picture == undefined) {
            return res.status(400).json({ code: 4, message: 'Parâmetros não enviados.' });
        }

        if(picture.indexOf('data:image/jpg;base64,') == -1) {
            return res.status(400).json({ code: 6, message: 'Foto informada esta inválida.' });
        }

        const fileName = uuidV4()+'.jpg';
        const fileNameNew = uuidV4()+'.jpg';
        const pathFile = path.resolve(__dirname, '..', '..', '..', 'temp', 'images', fileName);
        const pathFileNew = path.resolve(__dirname, '..', '..', '..', 'temp', 'images', 'novo'+fileNameNew);

        const bufferData = Buffer.from(picture.replace('data:image/jpg;base64,', ''), 'base64');
        await fs.writeFile(pathFile, bufferData);
        
        const dimen1 = await sharp(pathFile).metadata();
        let dimen2 = {} as any;

        let newPicture = '';
        if(dimen1 != undefined) {
            await new Promise((resolve) => {
                sharp(pathFile)
                .resize(720, 1080, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true
                })
                .withMetadata()
                .toFile(pathFileNew, async () => {
                    await fs.unlink(pathFile);
                    dimen2 = await sharp(pathFileNew).metadata();
                    resolve('');
                });
            });


            const newImageBase64 = await new Promise((resolve) => {
                if(dimen2?.orientation! == 6) {
                    sharp(pathFileNew)
                    .rotate(90)
                    .toBuffer(async (err, buffer) => {
                        console.log('rodou')
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    }); 
                } 
                else if(dimen2?.orientation! == 5) {
                    sharp(pathFileNew)
                    .rotate(-90)
                    .toBuffer(async (err, buffer) => {
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    }); 
                } else {
                    sharp(pathFileNew)
                    .toBuffer(async (err, buffer) => {
                        const base64Data = buffer.toString('base64');
                        await fs.unlink(pathFileNew);
                        resolve(base64Data);
                    }); 
                }
            });
            
            newPicture = 'data:image/jpg;base64,'+newImageBase64;
        } else {
            newPicture = picture;
        }

        await dbMysql.where({ id: itemId }).update({ comentario: comment, foto: newPicture }).limit(1).into('ocorrencias');

        return res.status(202).json({ updated: true });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 5, message: 'Erro interno.' });
    }
});

routerAppItems.delete('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IDeleteItem;

        if(id == undefined) {
            return res.status(400).json({ code: 6, message: 'Parâmetros não enviados.' });
        }

        await dbMysql.where({ id }).del().into('ocorrencias');

        return res.status(202).json({ updated: true });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 7, message: 'Erro interno.' });
    }
});


export { routerAppItems }