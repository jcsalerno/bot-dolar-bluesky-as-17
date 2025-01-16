"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@atproto/api");
const dotenv = __importStar(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
dotenv.config();
async function fetchDollarValue() {
    try {
        const { default: fetch } = await Promise.resolve().then(() => __importStar(require('node-fetch')));
        const response = await fetch(process.env.DOLLAR_API_URL);
        const data = await response.json();
        if (data && data.conversion_rates && typeof data.conversion_rates.BRL === 'number') {
            const dollarValue = data.conversion_rates.BRL.toFixed(2);
            return parseFloat(dollarValue);
        }
        else {
            throw new Error('Resposta da API não contém as taxas de conversão corretamente.');
        }
    }
    catch (error) {
        console.error('Erro ao buscar valor do dólar:', error);
        throw new Error('Não foi possível obter o valor do dólar');
    }
}
async function postToBlueSky(postMessage) {
    const agent = new api_1.BskyAgent({
        service: 'https://bsky.social',
    });
    try {
        console.log('Tentando login...');
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME,
            password: process.env.BLUESKY_PASSWORD,
        });
        console.log('Login bem-sucedido!');
        console.log('Criando post: ', postMessage);
        const response = await agent.post({
            text: postMessage,
            createdAt: new Date().toISOString(),
        });
        console.log('Post criado com sucesso: ', response);
    }
    catch (error) {
        console.error('Erro ao criar o post:', error);
    }
}
async function main() {
    try {
        const dollarValue = await fetchDollarValue();
        console.log('Valor do dólar:', dollarValue);
        const postMessage = `O valor do dólar hoje é: R$ ${dollarValue}`;
        await postToBlueSky(postMessage);
    }
    catch (error) {
        console.error('Erro:', error);
    }
}
node_cron_1.default.schedule('0 17 * * *', async () => {
    try {
        await main();
    }
    catch (error) {
        console.error('Erro ao executar o cron job:', error);
    }
});
console.log('Cron job agendado para rodar todos os dias às 17h');
