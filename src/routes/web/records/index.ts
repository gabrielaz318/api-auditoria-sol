//* ---- Importação bibliotecas
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { IGetRecords, IGetRecord, IPatchRecord, IPatchRecordChecklist, IDeleteRecords, IPatchRecordStatus } from './dto/IRecords';

const routerWebRecords = Router();


routerWebRecords.get('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { id, department, endDate, startDate, user } = query as IGetRecords;

        if(startDate == undefined || department == undefined || endDate == undefined || user == undefined || id == undefined) {
            return res.status(400).json({ code: 2, message: 'Parâmetros não enviados' });
        }

        let recordsDB = [] as any;

        let filters = '';
        if(department != 0 || user != 0) {
            if(department != 0) {
                filters += ` AND reg.setor = ${department}`
            }
            
            if(user != 0) {
                filters += ` AND reg.criador = ${user}`
            }

        }

        if(id != 0) {
            [recordsDB] = await dbMysql.raw(`
                SELECT
                    reg.id id,
                    usu.usuario creator,
                    reg.criador creator_id,
                    seto.setor department,
                    reg.setor department_id,
                    (CASE WHEN reg.status = 1 THEN
                        'Andamento' 
                    ELSE
                        'Finalizado'
                    END) as status,
                    reg.status status_id,
                    (SELECT COUNT(*) FROM ocorrencias WHERE registro = reg.id) as pictures,
                    DATE_FORMAT(reg.dh_criacao, '%d/%m/%Y') created_at
                FROM
                    registros reg
                LEFT JOIN usuarios usu ON reg.criador = usu.id
                LEFT JOIN setores seto ON reg.setor = seto.id
                WHERE
                    reg.id = ?;
            `,[id]);
        } else {
            [recordsDB] = await dbMysql.raw(`
                SELECT
                    reg.id id,
                    usu.usuario creator,
                    reg.criador creator_id,
                    seto.setor department,
                    reg.setor department_id,
                    (CASE WHEN reg.status = 1 THEN
                        'Andamento' 
                    ELSE
                        'Finalizado'
                    END) as status,
                    reg.status status_id,
                    (SELECT COUNT(*) FROM ocorrencias WHERE registro = reg.id) as pictures,
                    DATE_FORMAT(reg.dh_criacao, '%d/%m/%Y') created_at
                FROM
                    registros reg
                LEFT JOIN usuarios usu ON reg.criador = usu.id
                LEFT JOIN setores seto ON reg.setor = seto.id
                WHERE
                    DATE(reg.dh_criacao) BETWEEN ? AND ?
                    ${filters}
                ORDER By reg.id DESC;
            `,[startDate, endDate]);
        }

        const [usersDB] = await dbMysql.raw(`
            SELECT
                id,
                usuario as user
            FROM
                usuarios
            WHERE
                id in (SELECT criador FROM registros GROUP BY criador);
        `);

        const [departmentsDB] = await dbMysql.raw(`
            SELECT
                id,
                setor as department
            FROM
                setores
            WHERE
                id in (SELECT setor FROM registros GROUP BY setor);
        `);

        const finalData = {
            records: recordsDB,
            users: usersDB,
            departments: departmentsDB
        }

        return res.send(finalData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 1, message: 'Erro interno' });
    }
});

routerWebRecords.get('/items', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IGetRecord;

        if(id == undefined) {
            return res.status(400).json({ code: 3, message: 'Parâmetros não enviados' });
        }

        const [recordDB] = await dbMysql.raw(`
            SELECT
                reg.id id,
                usu.usuario creator,
                seto.setor department,
                (CASE WHEN reg.status = 1 THEN
                    'Andamento' 
                ELSE
                    'Finalizado'
                END) as status,
                reg.checklist checklist,
                reg.status status_id,
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

        const itemsRecord = await dbMysql.select('id', 'comentario as comment', 'foto as picture', 'dh_criacao as created_at').where({ registro: id }).into('ocorrencias');

        const finalData = {
            record: {
                ...recordDB[0],
                checklist: recordDB[0].checklist == null ? recordDB[0].checklist : JSON.parse(recordDB[0].checklist)
            },
            items: itemsRecord
        }

        return res.json(finalData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 4, message: 'Erro interno' });
    }
});

routerWebRecords.patch('/editStatus', async (req, res) => {
    try {
        const body = req.body as any;
        const { id, status } = body as IPatchRecordStatus;
        console.log(id, status)
        if(id == undefined || status == undefined) {
            return res.status(400).json({ code: 64, message: 'Parâmetros não enviados' });
        }
        await dbMysql.where({ id }).update({ status }).limit(1).into('registros');

        return res.send();
    } catch (error) {
        return res.status(500).send();
    }
});

routerWebRecords.delete('/item', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IDeleteRecords;

        if(id == undefined) {
            return res.status(400).json({ code: 7, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id }).del().limit(1).into('ocorrencias');

        return res.send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 8, message: 'Erro interno' });
    }
});

routerWebRecords.patch('/editComent', async (req, res) => {
    try {
        const body = req.body as any;
        const { id, comment } = body as IPatchRecord;

        console.log(id, comment)
        if(id == undefined || comment == undefined) {
            return res.status(400).json({ code: 64, message: 'Parâmetros não enviados' });
        }
        await dbMysql.where({ id }).update({ comentario: comment }).limit(1).into('ocorrencias');

        return res.send();
    } catch (error) {
        return res.status(500).send();
    }
});

routerWebRecords.patch('/editChecklist', async (req, res) => {
    try {
        const body = req.body as any;
        const { id, checklist } = body as IPatchRecordChecklist;

        if(id == undefined || checklist == undefined) {
            return res.status(400).json({ code: 64, message: 'Parâmetros não enviados' });
        }
        await dbMysql.where({ id }).update({ checklist: checklist }).limit(1).into('registros');

        return res.send();
    } catch (error) {
        console.log(error)
        return res.status(500).send();
    }
});

routerWebRecords.delete('/item', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IDeleteRecords;

        if(id == undefined) {
            return res.status(400).json({ code: 7, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id }).del().limit(1).into('ocorrencias');

        return res.send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 8, message: 'Erro interno' });
    }
});

routerWebRecords.delete('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IDeleteRecords;

        if(id == undefined) {
            return res.status(400).json({ code: 7, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ registro: id }).del().into('ocorrencias');

        await dbMysql.where({ id }).del().into('registros');

        return res.send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 8, message: 'Erro interno' });
    }
});

export { routerWebRecords }