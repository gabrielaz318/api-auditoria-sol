//* ---- Importação bibliotecas
import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';


//* ---- Importação de funções
import { decrypt } from '../../utils/decrypt';
import { dbMysql } from '../../database/mysql';


//* ---- Importação de tipagem
import { IGetResquestAuth } from './dto/IAuth';

import { validateToken } from '../services/validateToken';


const routerAuth = Router();

routerAuth.get('/', async (req, res) => {
    try {
        console.log('veio')
        const query = req.query as any;
        const { user, password } = query as IGetResquestAuth ;
        
        if(user == undefined || password == undefined) {
            return res.status(400).json({ code: 1, message: 'Parâmetros não enviados' })
        }; 

        const decryptedPassword = decrypt(password);
        
        const [userDB] = await dbMysql.select('id', 'nome', 'usuario', 'senha', 'ativo').where({ usuario: user }).into('usuarios');

        if(userDB.ativo == 0) {
            return res.status(401).json({ code: 6, title: 'Usuário desativado', message: 'Você não pode mais acessar o app, caso precise entre com contato com o T.I. para habilitar seu acesso.' })
        }

        const result = await bcrypt.compare(decryptedPassword, userDB.senha);
        
        if(result){
            const token = jwt.sign({ id: userDB.id }, process.env.SECRET_JWT as string, { expiresIn: 60 * 60 * 72 });

            return res.status(202).json({ token, userInfo: { id: userDB.id, user: userDB.usuario, name: userDB.nome } });
        } else {
            return res.status(401).json({code: 4, title: 'Credenciais incorretas', message: 'Verifique o usuário ou senha inseridos.'});
        }
    
    } catch (error) {
        console.log(error)
        return res.status(401).json({code: 5, title: 'Erro interno', message: 'Houve um erro interno ao realizar o login, contate o T.I.\n\nCódigo: 5'});
    }
});

routerAuth.get('/me', validateToken, async (req, res) => {
    try {
        if(req.userId == undefined) {
            return res.status(401).json({ code: 4878623, message: 'Token enviado está sem um parâmetro necessário.' });
        }

        const [userData] = await dbMysql.select('nome', 'usuario').where({ id: req.userId }).limit(1).into('usuarios');

        const finalData = {
            name: userData.nome,
            user: userData.usuario
        }

        return res.json(finalData);
    } catch (error) {
        return res.status(500).json({ code: 2, message: 'Erro ao recuperar dados do usuário.' })
    }
});

export { routerAuth };