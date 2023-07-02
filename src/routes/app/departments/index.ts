//* ---- Importação bibliotecas
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';

const routerAppDepartaments = Router();


routerAppDepartaments.get('/', async (req, res) => {
    try {
        const departmentsDB = await dbMysql.select('id', 'setor', 'ativo').orderBy('setor').into('setores');

        const departmentsDBFormatted = departmentsDB.map(item => ({ id: item.id, department: item.setor, active: item.ativo }));

        return res.send(departmentsDBFormatted);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 1, message: 'Erro interno.' });
    }
});

export { routerAppDepartaments }