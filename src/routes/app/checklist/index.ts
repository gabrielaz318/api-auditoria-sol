//* ---- Importação bibliotecas
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';

const routerAppChecklist = Router();


routerAppChecklist.get('/', async (req, res) => {
    try {
        const checklist = await dbMysql.select('checklist').orderBy('id', 'desc').limit(1).into('checklists');
        if(checklist.length == 0) {
            return res.status(404).json({ code: 1, message: 'Nenhum checklist localizado, certifique-se de que existe um checklist cadastrado no sistemna.' });
        }

        return res.json(JSON.parse(checklist[0].checklist));
    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 1, message: 'Erro interno.' });
    }
});

export { routerAppChecklist }