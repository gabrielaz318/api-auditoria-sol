import * as dotenv from "dotenv";
dotenv.config({
    path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env'
});

import cors from 'cors';
import express from 'express';

import { routerAuth } from './routes/auth';

import { routerAppItems } from "./routes/app/items";
import { routerAppRecords } from "./routes/app/records";
import { routerAppChecklist } from "./routes/app/checklist";
import { routerAppDepartaments } from "./routes/app/departments";

import { routerWebUsers } from "./routes/web/users";
import { routerWebRecords } from "./routes/web/records";
import { routerWebParameters } from "./routes/web/parameters";

import { validateToken } from "./routes/services/validateToken";
import { routerWebItems } from "./routes/web/items";
import { routerWebEjs } from "./routes/web/ejs";
import { routerWebFiles } from "./routes/web/files";

const app = express();


//* -----  MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));


//* -----  AUTENTICAÇÃO
app.use('/auth', routerAuth);


//* -----  ROTAS PARA OS APPS
app.use('/app/items', validateToken, routerAppItems);
app.use('/app/records', validateToken, routerAppRecords);
app.use('/app/checklist', validateToken, routerAppChecklist);
app.use('/app/departments', validateToken, routerAppDepartaments);


//* -----  ROTAS PARA OS APPS
app.use('/web/ejs', routerWebEjs);
app.use('/web/users', validateToken, routerWebUsers);
app.use('/web/files', routerWebFiles);
app.use('/web/items', validateToken, routerWebItems);
app.use('/web/records', validateToken, routerWebRecords);
app.use('/web/parameters', validateToken, routerWebParameters);

const port = 60500 as number;
app.listen(port, () => {
    console.log(`\n--- API Rodando na porta ${port} ---\n`);
});