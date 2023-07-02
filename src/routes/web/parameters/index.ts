//* ---- Importação bibliotecas
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { IGetDepartment, IDeleteDepartment, IPatchDepartmentActivate, IPatchDepartment } from './dto/IParameters';

const routerWebParameters = Router();


routerWebParameters.post('/department', async (req, res) => {
    const { department } = req.body as IGetDepartment;
    try {

        if(department == undefined) {
            return res.status(400).json({ code: 1, message: 'Parâmetros não enviados' });
        }

        await dbMysql.insert({ setor: department.trim() }).into('setores');

        return res.status(201).send();
    } catch (error: any) {
        if(error.sqlState) {
            const [returnDepartment] = await dbMysql.select('id', 'setor', 'ativo').where({ setor: department }).limit(1).into('setores');

            if(returnDepartment.ativo == 0) {
                return res.status(409).json({ code: 2, message: `O setor "${department.trim()}" já existe, porém está desativado. Deseja reativar?`, id: returnDepartment.id });
            }

            return res.status(409).json({ code: 3, message: `O setor "${department.trim()}" já existe.` });
        }
        return res.status(500).json({ code: 4, message: 'Erro interno' });
    }
});

routerWebParameters.get('/department', async (req, res) => {
    try {
        const returnDepartments = await dbMysql.select('id', 'setor as department').where({ ativo: 1 }).orderBy('setor').into('setores');

        return res.json(returnDepartments);
    } catch (error) {
        return res.status(500).json({ code: 5, message: 'Erro interno' });
    }
});

routerWebParameters.patch('/department', async (req, res) => {
    const { id, department } = req.body as IPatchDepartment;
    try {

        if(id == undefined || department == undefined) {
            return res.status(400).json({ code: 6, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id: id }).update({ setor: department.trim() }).limit(1).into('setores');

        return res.status(202).send();
    } catch (error: any) {
        if(error.sqlState) {
            const [returnDepartment] = await dbMysql.select('id', 'setor', 'ativo').where({ setor: department }).limit(1).into('setores');

            if(returnDepartment.ativo == 0) {
                return res.status(409).json({ code: 7, message: `O setor "${department.trim()}" já existe, porém está desativado. Deseja reativar?`, id: returnDepartment.id });
            }

            return res.status(409).json({ code: 8, message: `O setor "${department.trim()}" já existe.` });
        }
        return res.status(500).json({ code: 9, message: 'Erro interno' });
    }
});

routerWebParameters.patch('/department/activate', async (req, res) => {
    const { id } = req.body as IPatchDepartmentActivate;
    try {

        if(id == undefined) {
            return res.status(400).json({ code: 10, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id: id }).update({ ativo: 1 }).limit(1).into('setores');

        return res.status(202).send();
    } catch (error) {
        return res.status(500).json({ code: 11, message: 'Erro interno' });
    }
});

routerWebParameters.delete('/department/:id', async (req, res) => {
    try {
        const params = req.params as any;
        const { id } = params as IDeleteDepartment;

        if(id == undefined) {
            return res.status(400).json({ code: 12, message: 'Parâmetros não enviados' });
        }

        await dbMysql.where({ id: id }).update({ ativo: 0 }).limit(1).into('setores');

        return res.status(202).send();
    } catch (error) {
        return res.status(500).json({ code: 13, message: 'Erro interno' });
    }
});


export { routerWebParameters }