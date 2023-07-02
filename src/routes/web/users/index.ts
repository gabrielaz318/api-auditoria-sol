//* ---- Importação bibliotecas
import bcrypt from 'bcrypt';
import { format } from 'date-fns';
import { Router } from 'express';


//* ---- Importação de funções
import { dbMysql } from '../../../database/mysql';
import { decrypt } from '../../../utils/decrypt';
import { IPatchRequestChangePassAuthenticated, IPatchRequestUsers, IPostResquestUsers } from './dto/IUsers';

const routerWebUsers = Router();

routerWebUsers.get('/', async (req, res) => {
    try {
        const returnUsers = await dbMysql.select('id', 'nome', 'usuario', 'ativo', 'dh_criacao').into('usuarios');
        
        const listFormatted = returnUsers.map(item => ({
            id: item.id,
            name: item.nome,
            user: item.usuario,
            status: item.ativo,
            created_at: format(item.dh_criacao, 'dd/MM/yyyy')
        }))

        return res.json(listFormatted);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ code: 1, message: 'Erro interno' });
    }
});

routerWebUsers.post('/', async (req, res) => {
    try {
        const { name, user, password, confirmPassword } = req.body as IPostResquestUsers ;
        
        if(name == undefined || user == undefined || password == undefined || confirmPassword == undefined) {
            return res.status(400).json({ code: 1, message: 'Parâmetros não enviados' })
        }; 

        const decryptedPassword = decrypt(password);
        const decryptedConfirmPassword = decrypt(confirmPassword);

        if(decryptedPassword !== decryptedConfirmPassword) {
            return res.status(400).json({ code: 2, message: 'Senhas não conferem' });
        }
        
        const userDB = await dbMysql.select('usuario').where({ usuario: user }).into('usuarios');

        if(!(userDB.length == 0)) {
            return res.status(400).json({ code: 3, message: 'O nome do usuário informado já está sendo utilizado.' });
        }

        bcrypt.hash(decryptedPassword, 10, async (err, hash) => {
            if(err) return res.status(500).json({ code: 4, message: 'Houve um erro ao criptografar senha.' });
    
            await dbMysql.insert({ nome: name, usuario: user, senha: hash }).into('usuarios');

            return res.send();
        });
    } catch (error) {
        return res.send(error)
    }
});

routerWebUsers.patch('/', async (req, res) => {
    try {
        const { id, name, password, confirmPassword, status, user } = req.body as IPatchRequestUsers;
        
        if(id == undefined || name == undefined || password == undefined || confirmPassword == undefined || status == undefined || user == undefined) {
            return res.status(400).json({ code: 6, message: 'Parâmetros não enviados' });
        }

        const decryptedPassword = decrypt(password);
        const decryptedConfirmPassword = decrypt(confirmPassword);

        if(decryptedPassword.trim().length != 0 || decryptedConfirmPassword.trim().length !== 0) {
            if(decryptedPassword.trim() !== decryptedConfirmPassword.trim()) {
                return res.status(400).json({ code: 8, message: 'As senhas não conferem' })
            }
        }

        if(decryptedPassword.trim().length != 0 || decryptedConfirmPassword.trim().length !== 0) {
            bcrypt.hash(decryptedPassword, 10, async (err, hash) => {
                if(err) return res.status(500).json({ code: 4, message: 'Houve um erro ao criptografar senha.' });
        
                await dbMysql.where({ id }).update({ nome: name, usuario: user, ativo: status, senha: hash }).limit(1).into('usuarios');
    
                return res.send();
            });
        } else {
            await dbMysql.where({ id }).update({ nome: name, usuario: user, ativo: status }).limit(1).into('usuarios');
    
            return res.send();
        }
    } catch (error) {
        return res.status(500).json({ code: 7, message: 'Erro interno' });
    }
});

routerWebUsers.patch('/changePassAuthenticated', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body as IPatchRequestChangePassAuthenticated;
        
        if(password == undefined || confirmPassword == undefined) {
            return res.status(400).json({ code: 9, message: 'Parâmetros não enviados' });
        }

        const decryptedPassword = decrypt(password);
        const decryptedConfirmPassword = decrypt(confirmPassword);

        if(decryptedPassword.trim() !== decryptedConfirmPassword.trim()) {
            return res.status(400).json({ code: 11, message: 'As senhas não conferem' })
        }

        bcrypt.hash(decryptedPassword, 10, async (err, hash) => {
            if(err) return res.status(500).json({ code: 4, message: 'Houve um erro ao criptografar senha.' });
    
            await dbMysql.where({ id: req.userId }).update({ senha: hash }).limit(1).into('usuarios');

            return res.send();
        });

    } catch (error) {
        return res.status(500).json({ code: 10, message: 'Erro interno' });
    }
});


export { routerWebUsers }