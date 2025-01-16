import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();
async function fetchDollarValue() {
    try {
        // Carregar o fetch dinamicamente
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(process.env.DOLLAR_API_URL);
        const data = await response.json(); // Usar 'unknown' para checar o tipo antes de usar
        // Validar que o 'data' tem a estrutura esperada
        if (data &&
            data.conversion_rates &&
            typeof data.conversion_rates.BRL === 'number') {
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
    const agent = new BskyAgent({
        service: 'https://bsky.social',
    });
    try {
        console.log('Tentando login...');
        // Realizar login no BlueSky
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME,
            password: process.env.BLUESKY_PASSWORD,
        });
        console.log('Login bem-sucedido!');
        console.log('Criando post: ', postMessage);
        // Criar o post no BlueSky
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
        // Buscar o valor do dólar
        const dollarValue = await fetchDollarValue();
        console.log('Valor do dólar:', dollarValue);
        // Criar a mensagem do post
        const postMessage = `O valor do dólar hoje é: R$ ${dollarValue}`;
        // Postar no BlueSky
        await postToBlueSky(postMessage);
    }
    catch (error) {
        console.error('Erro:', error);
    }
}
cron.schedule('22 18 * * *', async () => {
    try {
        await main();
    }
    catch (error) {
        console.error('Erro ao executar o cron job:', error);
    }
});
console.log('Cron job agendado para rodar todos os dias às 17h');
main();
