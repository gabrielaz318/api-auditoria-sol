//* ---- Importação bibliotecas
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { IDeleteRecords, IGetRecords, IPatchRecords, IPostRecords } from './dto/IRecords';

const routerAppRecords = Router();


routerAppRecords.get('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { createdAt, department, useCreatedAt, useDepartment } = query as IGetRecords;

        if(createdAt == undefined || department == undefined || useCreatedAt == undefined || useDepartment == undefined) {
            return res.status(400).json({ code: 2, message: 'Parâmetros não enviados' });
        }

        const recordsDB = await dbMysql.select('registros.id', 'registros.setor as id_setor', 'setores.setor', 'registros.criador as id_usuario', 'usuarios.nome', 'registros.status', 'registros.dh_criacao')
            .from('registros')
            .leftJoin('usuarios', 'usuarios.id', 'registros.criador')
            .leftJoin('setores', 'setores.id', 'registros.setor')
            .where({ 'registros.status': 1 })
            .orderBy('id');

        const recordsDBDateFormatted = recordsDB.map(item => ({ ...item, dh_criacaoFormatado: format(new Date(item.dh_criacao), 'dd/MM/yyyy') }))
        let recordsFiltered = recordsDBDateFormatted;

        if(useCreatedAt == '1') {
            recordsFiltered = recordsFiltered.filter(item => item.dh_criacaoFormatado == createdAt);
        }

        if(useDepartment == '1') {
            recordsFiltered = recordsFiltered.filter(item => item.id_setor == useDepartment);
        }
        
        recordsFiltered = recordsFiltered.map(item => ({
            id: item.id,
            creator: item.nome,
            creator_id: item.id_usuario,
            department: item.setor,
            id_department: item.id_setor,
            created_at: item.dh_criacao
        }));

        return res.send(recordsFiltered)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 1, message: 'Erro interno' });
    }
});

routerAppRecords.post('/', async (req, res) => {
    try {
        const { created_at, creator, department } = req.body as IPostRecords;
        
        if(created_at == undefined || creator == undefined || department == undefined) {
            return res.status(400).json({ code: 4, message: 'Parâmetros não informados.' });
        }

        const [returnDB] = await dbMysql.insert({ criador: creator, setor: department, dh_criacao: new Date(created_at), status: 1 }).into('registros');
        
        return res.status(202).json({ id: returnDB, created: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 3, message: 'Erro interno', created: false });
    }
});

routerAppRecords.patch('/', async (req, res) => {
    try {
        const { id, checklist } = req.body as IPatchRecords;

        if(id == undefined || checklist == undefined) {
            return res.status(400).json({ code: 5, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id }).update({ status: 2, checklist }).limit(1).into('registros');

        return res.send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 6, message: 'Erro interno' });
    }
});

routerAppRecords.delete('/', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IDeleteRecords;

        if(id == undefined) {
            return res.status(400).json({ code: 7, message: 'Parâmetros não enviados' });
        }

        const [retornoStatus] = await dbMysql.select('status').where({ id }).into('registros');

        if(retornoStatus?.status == 2) {
            return res.send();
        }

        await dbMysql.where({ registro: id }).del().into('ocorrencias');

        await dbMysql.where({ id }).del().into('registros');

        return res.send();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 8, message: 'Erro interno' });
    }
});


export { routerAppRecords }