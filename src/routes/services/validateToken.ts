import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbMysql } from '../../database/mysql';

declare module "express-serve-static-core" {
    interface Request {
        userId: number;
    }
}  

async function validateToken(req: Request, res: Response, next: NextFunction) {
    try {
        const authorization = req.headers.authorization as string;
        
        if(authorization == undefined || String(authorization)?.split(' ')[0] != 'Bearer') {
            return res.status(401).json({ code: 89465, message: 'Token não enviado' });
        }

        const token = String(authorization).split(' ')[1];

        jwt.verify(token, process.env.SECRET_JWT as string, async (err, decoded) => {
            if(err?.name == 'TokenExpiredError') {
                return res.status(401).json({ code: 124587, title: 'Acesso expirado', message: 'Seu acesso expirou, refaça o login para continuar utilizando o app.' });

            } else if(err?.name == 'JsonWebTokenError') {
                return res.status(401).json({ code: 458988, message: 'Token enviado está inválido.' });

            } else if(err) {
                return res.status(401).json({ code: 999898, message: 'Token enviado está inválido.' });
            }

            const { id, iat, exp } = decoded as {id: number, iat: number, exp: number }

            const returnUsuario = await dbMysql.select('id').where({ id, ativo: 1 }).into('usuarios');

            if(returnUsuario.length == 0) {
                return res.status(401).json({ code: 45697859, title: 'Usuário desativado', message: 'Você não pode mais acessar o app, caso precise entre com contato com o T.I. para habilitar seu acesso.' });
            }
            
            req.userId = id;

            next()
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ code: 99589, message: 'Erro interno' });
    }
}

export { validateToken }