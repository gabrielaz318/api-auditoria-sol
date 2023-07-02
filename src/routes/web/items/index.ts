//* ---- Importação bibliotecas
import ejs from 'ejs';
import path from 'path';
import puppeteer from 'puppeteer';
import { v4 as uuidV4 } from 'uuid';
import { Router } from 'express';


//* ---- Importação de funções
import { IGetRequestPDF, IGetRequestPDFChecklist } from './dto/IItems';

const routerWebItems = Router();

routerWebItems.get('/pdf', async (req, res) => {
    try {
        const query = req.query as any;
        const { id, type } = query as IGetRequestPDF;
        
        if(id == undefined || type == undefined) {
            return res.status(400).json({ code: 1, message: 'Parâmetros não enviados' });
        }

        const cssHeaderStyle = `<style>
            p {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                display: block;
                paddng: 0;
                margin: 0;
                text-align: center!important;
                font-size: 11px;
                margin: 0 auto;
                color: #212529;
            }
        </style>`;
        
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--cap-add=SYS_ADMIN']})
        const page = await browser.newPage()
        
        await page.goto(`${process.env.SERVER_URL}/web/ejs/${process.env.EJS_KEY}/generatePDF?id=${id}&type=${type}`,  {
            waitUntil: 'networkidle0'
        });

        const fileName = `${uuidV4()}__${type == 1 ? 'Relatorio-SOL' : 'Relatorio-RECINTOS-ZOO'}.pdf`;
        const pathFile = path.resolve(__dirname, '..', '..', '..', 'temp', 'reports', fileName);

        await page.pdf({
            format: 'A4',
            path: pathFile,
            printBackground: true,
            displayHeaderFooter: true,
            footerTemplate: cssHeaderStyle+'<p>SUA EMPRESA - SETOR RESPONSÁVEL</p>',
            margin: {
                top: '20px',
                bottom: '40px',
                left: '20px',
                right: '20px'
            }
        });

        const finalData = { url: `${process.env.SERVER_URL}/web/files/pdfItem/${encodeURI(fileName)}` }

        return res.json(finalData);
    } catch (error) {
        return res.send(error)
        
    }
});

routerWebItems.get('/pdfChecklist', async (req, res) => {
    try {
        const query = req.query as any;
        const { id } = query as IGetRequestPDFChecklist;

        const browser = await puppeteer.launch({args: ['--no-sandbox', '--cap-add=SYS_ADMIN']})
        const page = await browser.newPage()
        
        await page.goto(`${process.env.SERVER_URL}/web/ejs/${process.env.EJS_KEY}/generatePDFChecklist?id=${id}`,  {
            waitUntil: 'networkidle0'
        });

        const fileName = `${uuidV4()}__Checklist-SOL.pdf`;
        const pathFile = path.resolve(__dirname, '..', '..', '..', 'temp', 'reports', fileName);

        await page.pdf({
            format: 'A4',
            path: pathFile,
            printBackground: true,
            landscape: true,
            margin: {
                top: '20px',
                bottom: '40px',
                left: '20px',
                right: '20px'
            }
        });

        const finalData = { url: `${process.env.SERVER_URL}/web/files/pdfItem/${encodeURI(fileName)}` }

        return res.json(finalData);
    } catch (error) {
        return res.send(error);
    }
});

export { routerWebItems }