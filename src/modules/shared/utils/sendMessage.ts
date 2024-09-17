import TgBot from '../../../bot/bot';

export const sendOrder = async (id, order) => {
    const bot = new TgBot();
    await bot.sendNewOrder(id, order);
};

export const sendStreamOrder = async (id, order) => {
    const bot = new TgBot();
    await bot.sendStreamOrder(id, order);
};

export const sendUptatedOrder = async (id, order) => {
    const bot = new TgBot();
    await bot.sendUptatedOrder(id, order);
};

export const sendUptatedPayment = async (id, payment) => {
    const bot = new TgBot();
    await bot.sendUptatedPayment(id, payment);
};

export const sendNewProduct = async (id, product) => {
    const bot = new TgBot();
    await bot.sendNewProduct(id, product);
};

export const sendUpdatedProduct = async (id, product, r_price) => {
    const bot = new TgBot();
    await bot.sendUpdatedProduct(id, product, r_price);
};

export const sendMessage = async (id, message) => {
    const bot = new TgBot();
    await bot.sendMessage(id, message);
};

export const sendBlockedUser = async (id, user) => {
    const bot = new TgBot();
    await bot.sendBlockedUser(id, user);
};

export const sendBlockedUserManySms = async (id, user) => {
    const bot = new TgBot();
    await bot.sendBlockedUserManySms(id, user);
};
