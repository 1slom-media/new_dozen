import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import App from './server';
import router from './router';
import { dbConnection } from './database';
import { company, server } from './config/conf';
import TgBot from './bot/bot';
import { getEskizToken } from './modules/shared/utils/getEskizToken';

const Bot = new TgBot();

const ExpressApp = new App(router);

const httpserver = http.createServer(ExpressApp.getServer);

// const io = new Server(httpserver, {
//     cors: {
//         origin: [
//             'https://' + company.url,
//             'https://vipcrm.uz',
//             'http://localhost:3000',
//         ],
//     },
// });

// io.attach(httpserver);

// io.on('connection', (socket) => {
//     socket.on('new-order', (data) => {
//         socket.broadcast.emit('received-order', { order: { ...data } });
//     });

//     socket.on('new-request', (data) => {
//         socket.broadcast.emit('received-request', { request: { ...data } });
//     });
// });

dbConnection();
getEskizToken();
// Bot.runBot();

cron.schedule(`0 0 * * 0`, () => getEskizToken(), {
    scheduled: true,
    timezone: 'Asia/Tashkent',
});

httpserver.listen(server.httpPort, () =>
    console.log('Listening port on ' + server.httpPort)
);
