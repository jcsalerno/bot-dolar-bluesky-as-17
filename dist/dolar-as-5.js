import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import cron from 'node-cron';
dotenv.config();
// Função para obter o valor do dólar
async function fetchDollarValue() {
    try {
        const response = await fetch(process.env.DOLLAR_API_URL);
        // Tentar converter a resposta JSON em um tipo conhecido
        const data = await response.json();
        // Verificar se a resposta possui a estrutura correta
        if (data && data.conversion_rates && typeof data.conversion_rates.BRL === 'number') {
            // Acessar o valor do dólar em relação ao BRL e arredondar para 2 casas decimais
            const dollarValue = data.conversion_rates.BRL.toFixed(2);
            return parseFloat(dollarValue); // Retorna o valor como número com 2 casas decimais
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
// Função para fazer o post no BlueSky
async function postToBlueSky(postMessage) {
    const agent = new BskyAgent({
        service: 'https://bsky.social',
    });
    try {
        // Autenticação no BlueSky
        console.log('Tentando login...');
        await agent.login({
            identifier: process.env.BLUESKY_USERNAME,
            password: process.env.BLUESKY_PASSWORD,
        });
        console.log('Login bem-sucedido!');
        // Criar o post no BlueSky
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
// Função principal que combina as duas operações
async function main() {
    try {
        // Obter o valor do dólar
        const dollarValue = await fetchDollarValue();
        console.log('Valor do dólar:', dollarValue);
        // Criar a mensagem para o post
        const postMessage = `O valor do dólar hoje é: R$ ${dollarValue}`;
        // Postar no BlueSky
        await postToBlueSky(postMessage);
    }
    catch (error) {
        console.error('Erro:', error);
    }
}
// Agendando a execução do cron job todos os dias às 17h
cron.schedule('0 17 * * *', async () => {
    try {
        await main();
    }
    catch (error) {
        console.error('Erro ao executar o cron job:', error);
    }
});
console.log('Cron job agendado para rodar todos os dias às 17h');
