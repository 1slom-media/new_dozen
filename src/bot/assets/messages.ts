import { company } from '../../config/conf';
import { createDate } from '../../modules/shared/utils/moment';

const messages = {
    menuMsg: `📖 Asosiy menyu`,
    settings: `⚙️ Sozlamalar`,
    holdOrders: `📅 Keyin olinadigan buyurtmalar`,
    channels: `📢 Kanallarim`,
    authMsg: `🚫 Sizda hozirda botdan foydalanish imkoni yo'q\nsayt orqali kirib qaytadan urinib ko'ring`,
    newOrderMsg: (order) =>
        `Yangi buyurtma rasmiylashtirildi !\n\nTelefon: <a href="tel:${order.phone}"><b>${order.phone}</b></a>\nIsmi: <b>${order.name}</b>`,
    newStreamOrderMsg: (order) =>
        `Yangi buyurtma rasmiylashtirildi !\n\nIsmi: <b>${order.name}</b>`,
    uptatedOrderMsg: (order) => {
        let status: string;
        switch (order.status) {
            case 'new':
                status = 'yangi';
                break;
            case 'ready':
                status = 'tayyor';
                break;
            case 'onway':
                status = `yo'lda`;
                break;
            case 'delivered':
                status = 'yetkazildi';
                break;
            case 'canceled':
                status = 'bekor qilindi';
                break;
            case 'pending':
                status = 'keyin oladi';
                break;
            case 'hold':
                status = 'hold';
                break;
            case 'archived':
                status = 'arxivlandi';
                break;
        }
        return `<a href=''>#Message</a>\n🔄 Buyurtma statusi o'zgartirildi\n\nBuyurtma raqami: #${order.number}\n📑 Status: <b>${status}</b>`;
    },
    uptatedPaymentMsg: (payment) => {
        let status: string;
        switch (payment.status) {
            case 'new':
                status = 'yangi';
                break;
            case 'ready':
                status = 'tayyor';
                break;
            case 'onway':
                status = `yo'lda`;
                break;
            case 'delivered':
                status = 'yetkazildi';
                break;
            case 'canceled':
                status = 'bekor qilindi';
                break;
            case 'pending':
                status = 'keyin oladi';
                break;
            case 'hold':
                status = 'hold';
                break;
            case 'archived':
                status = 'arxivlandi';
                break;
        }
        return `<a href=''>#Message</a>\n🔄 To'lov statusi o'zgartirildi\n\n📑 Status: <b>${status}</b>`;
    },
    sendNewProductMsg: (product) => {
        let status: string = 'success';
        return `<a href=''>#Message</a>\n🔄 To'lov statusi o'zgartirildi\n\n📑 Status: <b>${status}</b>`;
    },
    start_message: (ctx) =>
        `<b>Salom, ${ctx.message.chat.first_name.toString()} 👋👋</b>\n\n<em>jamoamizda sizni yana qayta kurishdan mamnunmiz.</em>`,
    infoOrder: (order) => {
        var result = '';
        order.orderItems.forEach((product) => {
            result += `--\nNomi: ${product.product.title.uz}\nSoni: ${product.quantity}\nNarxi: ${product.price}\n--`;
        });
        return result;
    },
    myBalance: (user) =>
        `Balans: <b>${user.balance.toLocaleString(
            'fr-FR'
        )}</b> so'm\nTo'langan: <b>${user.paid.toLocaleString(
            'fr-FR'
        )}</b> so'm`,
    statistics_menu: `📊 Statistkalardan kerakligini tanlang !`,
    payments: (data) => {
        let status: string;
        let result: string = ``;
        data.forEach((payment) => {
            switch (payment.status) {
                case 'accepted':
                    status = 'qabul qilindi';
                    break;
                case 'waiting':
                    status = 'kutilyabdi';
                    break;
                case 'fulfilled':
                    status = `to'landi`;
                    break;
                case 'rejected':
                    status = 'bekor qilindi';
                    break;
            }
            result =
                result +
                `\n🕠<b>Vaqti: <i>${createDate(
                    payment.createdAt
                )}</i></b>\n💸<b>Qiymati: <i>${
                    payment.amount
                }</i></b>\n💳<b>Karta raqami: <i>${
                    payment.card
                }</i></b>\n📡<b>Holati: <i>${status}</i></b>\n📩<b>Xabar: <i>${
                    payment?.message
                }</i></b>\n------------------------------------------------------`;
        });
        return result;
    },
    orders: (data) => {
        let status: string;
        let result: string = ``;

        data.forEach((order) => {
            switch (order.status) {
                case 'new':
                    status = 'yangi';
                    break;
                case 'ready':
                    status = 'tayyor';
                    break;
                case 'onway':
                    status = `yo'lda`;
                    break;
                case 'delivered':
                    status = 'yetkazildi';
                    break;
                case 'canceled':
                    status = 'bekor qilindi';
                    break;
                case 'pending':
                    status = 'keyin oladi';
                    break;
                case 'hold':
                    status = 'hold';
                    break;
                case 'archived':
                    status = 'arxivlandi';
                    break;
            }
            result =
                result +
                `\n🕠<b>Vaqti: <i>${createDate(
                    order.createdAt
                )}</i></b>\n🧾<b>Tartib raqami: <a href="">#${
                    order.number
                }</a></b>\n📡<b>Holati: <i>${status}</i></b>\n------------------------------------------------------`;
        });
        return result;
    },
    statistics: (data) =>
        `🛒Yangi: ${data.new}\n\n⏳Tayyor: ${data.ready}\n\n♻️Yo'lda ${data.onway}\n\n✅Yetkazilgan: ${data.delivered}\n\n⛔️Bekor qilingan: ${data.canceled}\n\n📞Hold: ${data.hold}\n\n⏳Arxivlangan: ${data.archived}\n\n`,
    sendNewProduct: (product) =>
        `➕ Yangi offer qo'shildi\n\n🛒'' <a href="https://${
            company.url
        }/shop/${product.uid}">${
            product.title.uz
        }</a> ''\n💰 Nraxi: ${product.price.toLocaleString('fr-FR')}`,
    sendUpdateProduct: (product, r_price) => {
        if (!r_price)
            return `✅ ''<a href="https://${company.url}/shop/${product.uid}">${
                product.title.uz
            }</a>'' offeri qayta ochildi\n\n👉 https://${company.url}/shop/${
                product.uid
            }\n💰 Narxi: ${product.price.toLocaleString(
                'fr-FR'
            )} so'm\n💵 Referal narx: ${product.referal_price.toLocaleString(
                'fr-FR'
            )} so'm`;

        return `✅ ''<a href="https://${company.url}/shop/${product.uid}">${
            product.name
        }</a>'' referal narxi o'zgardi\n\n👉 https://${company.url}/shop/${
            product.uid
        }\n💰 Narxi: ${product.price.toLocaleString(
            'fr-FR'
        )} so'm\n💵 Referal narx: ${product.referal_price.toLocaleString(
            'fr-FR'
        )} so'm`;
    },
    sendHoldProducts: `Ustiga bosish orqali buyurtma holatini <b>Yangi</b> ga o'zgartirasiz!`,
    wrongTimeMsg:
        "<b>Vaqtni na'munadagi ko'rinishda kiriting!</b>\n\n<i>Shuningdek <b>Soat</b> va <b>daqiqaning</b> to'g'riligini tekshiring</i>",
};

export default messages;
