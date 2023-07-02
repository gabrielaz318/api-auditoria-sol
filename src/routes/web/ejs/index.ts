//* ---- Importação bibliotecas
import ejs from 'ejs';
import path from 'path';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';

const routerWebEjs = Router();

routerWebEjs.get(`/${process.env.EJS_KEY}/generatePDF`, async (req, res) => {
    try {
        const query = req.query as any;
        const { id, type } = query;
        
        if(id == undefined || type == undefined) {
            return res.status(400).json({ code: 1, message: 'Parâmetros não enviados' });
        }

        const [recordDB] = await dbMysql.raw(`
            SELECT
                reg.id id,
                usu.usuario creator,
                (CASE WHEN reg.status = 1 THEN
                    'Andamento' 
                ELSE
                    'Finalizado'
                END) as status,
                seto.setor department,
                DATE_FORMAT(reg.dh_criacao, '%d/%m/%Y') created_at
            FROM
                registros reg
            LEFT JOIN usuarios usu ON reg.criador = usu.id
            LEFT JOIN setores seto ON reg.setor = seto.id
            WHERE
                reg.id = ?
            LIMIT 1;
        `,[id]);

        if(recordDB.length == 0) {
            return res.status(404).json({ code: 5, message: `Não foi possível encontrar nenhum registro com o ID ${id}` });
        }

        const itemsRecord = await dbMysql.select('id', 'comentario as comment', 'foto as picture').where({ registro: id }).into('ocorrencias');

        let items = [] as any;
        let temp = [] as any;
        let controllerLoop = 0;
        for (const item of itemsRecord) {
            temp.push(item)
            controllerLoop += 1;
            if(controllerLoop == 3) {
                items.push(temp);
                temp = [];
                controllerLoop = 0;
            }
        }
        if(itemsRecord.length % 3 > 0) {
            const finalItems = itemsRecord.slice(itemsRecord.length - itemsRecord.length % 3);
            items.push(finalItems);
        }

        const finalData = {
            record: recordDB[0],
            items
        }

        const filepath = path.resolve(__dirname, '..', '..', '..', 'pages', type == 1 ? 'itemPdf.ejs' : 'itemPdf_Recinto.ejs');
        
        ejs.renderFile(filepath, {dados: finalData},(err, data) => {
            if(err){
                console.log(err)
                return res.send('Erro na leitura do arquivo')
            }
    
            return res.send(data)
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 2, message: 'Erro interno' });
    }
});

routerWebEjs.get(`/${process.env.EJS_KEY}/generatePDFChecklist`, async (req, res) => {
    try {
        const { id } = req.query as any;

        const [recordDB] = await dbMysql.raw(`
            SELECT
                reg.id id,
                usu.usuario creator,
                (CASE WHEN reg.status = 1 THEN
                    'Andamento' 
                ELSE
                    'Finalizado'
                END) as status,
                reg.checklist,
                seto.setor department,
                DATE_FORMAT(reg.dh_criacao, '%d/%m/%Y') created_at
            FROM
                registros reg
            LEFT JOIN usuarios usu ON reg.criador = usu.id
            LEFT JOIN setores seto ON reg.setor = seto.id
            WHERE
                reg.id = ?
            LIMIT 1;
        `,[id]);

        if(recordDB.length == 0) {
            return res.status(404).json({ code: 5, message: `Não foi possível encontrar nenhum registro com o ID ${id}` });
        }

        if(recordDB[0].checklist == null) {
            return res.status(404).json({ code: 6, message: `Não foi possível encontrar nenhum checklist no registro com o ID ${id}` });
        }

        let checklist = JSON.parse(recordDB[0].checklist).checklist;
        
        checklist = checklist.sort((a: any, b: any) => {
            if(a?.title < b?.title) return 1;
            if(a?.title > b?.title) return -1;
            return 0;
        })

        let newList = [];
        let average = 0;
        for (const item of checklist) {
            let item3 = [];
            let averageGrade = 0;
            for (const item2 of item.items.filter((item3: any) => item3.grade != -1)) {
                item3.push({
                    title: item.title,
                    ...item2
                });
                averageGrade += item2.grade;
            }
            if(item.items.filter((item3: any) => item3.grade != -1).length > 0) {
                average += averageGrade / item.items.filter((item3: any) => item3.grade != -1).length;
                newList.push(item3);
            }
        }

        average = average / newList.length;
        
        const data = {
            id: recordDB[0].id,
            creator: recordDB[0].creator,
            department: recordDB[0].department,
            created_at: recordDB[0].created_at,
            checklist: newList,
            grades: JSON.parse(recordDB[0].checklist).grades,
            average: average.toFixed(1)
        }
        
        const filepath = path.resolve(__dirname, '..', '..', '..', 'pages', 'itemChecklist.ejs');
        
        ejs.renderFile(filepath, {dados: data},(err, data) => {
            if(err){
                console.log(err);
                return res.send('Erro na leitura do arquivo');
            }
    
            return res.send(data);
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 2, message: 'Erro interno' });
    }
});

export { routerWebEjs }