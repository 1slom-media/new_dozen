import { bot, company } from '../../config/conf';
import { InlineKeyboard } from 'grammy';

const InlineKeyboards = {
    inline_menu: new InlineKeyboard()
        .text('🗒 Buyurtmalar', 'my_orders')
        .text(`📑 To'lovlar`, `my_payments`)
        .row()
        .text('💰 Balans', `my_balance`)
        .text('📊 Statistika', `statistics_menu`),

    post_checker: new InlineKeyboard()
        .text('Bekor qilish', 'reset_post')
        .text(`Tasdiqlash`, `set_post`),

    edit_status: (status, id) =>
        new InlineKeyboard()
            .text(
                `${status == 'new' ? '✅' : ''} yangi`,
                `edit_status?status=new&id=${id}`
            )
            .text(
                `${status == 'ready' ? '✅' : ''} tayyor`,
                `edit_status?status=ready&id=${id}`
            )
            .row()
            .text(
                `${status == 'onway' ? '✅' : ''} yo'lda`,
                `edit_status?status=onway&id=${id}`
            )
            .text(
                `${status == 'delivered' ? '✅' : ''} yetkazildi`,
                `edit_status?status=delivered&id=${id}`
            )
            .row()
            .text(
                `${status == 'canceled' ? '✅' : ''} bekor qilindi`,
                `edit_status?status=canceled&id=${id}`
            )
            .text(
                `${status == 'pending' ? '✅' : ''} kutilmoqda`,
                `edit_status?status=pending&id=${id}`
            )
            .row()
            .text(
                `${status == 'hold' ? '✅' : ''} hold`,
                `edit_status?status=hold&id=${id}`
            )
            .text(
                `${status == 'archived' ? '✅' : ''} arxivlandi`,
                `edit_status?status=archived&id=${id}`
            )
            .row()
            .text('Orqaga ↩️', `back?step=edited_order&id=${id}`),

    my_balance: new InlineKeyboard().text('Orqaga ↩️', `back?step=main_menu`),
    holdOrders_menu: (orders: any[], page, countPage, id) => {
        var result = [];
        var row = [];

        orders.forEach((time, i) => {
            row.push({
                text: `🔙 ${time['product']}`,
                callback_data: `update_order?order=${time['_id']}`,
            });
            if (i + 1 == orders.length && row.length == 1) result.push(row);
            if (i % 2 != 0) {
                result.push(row);
                row = [];
            }
        });
        result.push([
            {
                text: '◀️',
                callback_data: `update_order?page=${Number(page) - 1}`,
            },
            { text: `${page}/${countPage}`, callback_data: 'jimijimi' },
            {
                text: '▶️',
                callback_data: `update_order?page=${Number(page) + 1}`,
            },
        ]);

        return result;
    },
    send_order: (order) => {
        var status;
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
                status = 'kutilmoqda';
                break;
            case 'hold':
                status = 'hold';
                break;
            case 'archived':
                status = 'arxivlandi';
                break;
        }
        return [
            [
                {
                    text: `✏️ tahrirlash`,
                    callback_data: `edit_order?status=${order.status}&id=${order._id}`,
                },
                {
                    text: `🔄`,
                    callback_data: `refresh_order?id=${order._id}`,
                },
            ],
            [
                {
                    text: `status: ${status}`,
                    callback_data: 'test',
                },
                {
                    text: `ℹ️`,
                    callback_data: `info_order?id=${order._id}`,
                },
            ],
        ];
    },
    sendStreamOrder: (order) => {
        var status;
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
                status = 'kutilmoqda';
                break;
            case 'hold':
                status = 'hold';
                break;
            case 'archived':
                status = 'arxivlandi';
                break;
        }
        return [
            [
                {
                    text: `ℹ️`,
                    callback_data: `info_order?id=${order._id}`,
                },

                {
                    text: `🔄`,
                    callback_data: `refresh_order?id=${order._id}`,
                },
            ],
            [
                {
                    text: `status: ${status}`,
                    callback_data: 'test',
                },
            ],
        ];
    },
    sendBlockedUser: (user) => {
        return [
            [
                {
                    text: `${user.status == 0 ? '✅ Bloklangan' : 'Bloklash'}`,
                    callback_data: `set_block?id=${user._id}&status=0`,
                },

                {
                    text: `${
                        user.status == 1
                            ? '✅ Bloklanmagan'
                            : 'Blokdan chiqarish'
                    }`,
                    callback_data: `reset_block?id=${user._id}&status=1`,
                },
            ],
        ];
    },
    statisticsMenu: new InlineKeyboard()
        .text('Shaxsiy', `my_statistics`)
        .text('Umumiy', 'all_statistics')
        .row()
        .text('Orqaga ↩️', `back?step=main_menu`),

    statisticsTable: (bool, t?: string) =>
        new InlineKeyboard()
            .text(
                `${t == 'today' ? '✅' : ''}` + 'Bugungi',
                `statistics?time=today`
            )
            .text(
                `${t == 'yesterday' ? '✅' : ''}` + 'Kechagi',
                `statistics?time=yesterday`
            )
            .row()
            .text(
                `${t == 'weekly' ? '✅' : ''}` + 'Haftalik',
                `statistics?time=weekly`
            )
            .text(
                `${t == 'monthly' ? '✅' : ''}` + 'Oylik',
                `statistics?time=monthly`
            )
            .row()
            .text(
                'Orqaga ↩️',
                `${bool == true ? 'statistics_menu' : 'back?step=main_menu'}`
            ),
    paymentsTable: (page: number, countPage: number) =>
        new InlineKeyboard()
            .text('◀️', `my_payment?page=${page - 1}`)
            .text(`${page}/${countPage}`, 'jimijimi')
            .text('▶️', `my_payment?page=${page + 1}`)
            .row()
            .text('Orqaga ↩️', `back?step=main_menu`),
    myOrdersTable: (page: number, countPage: number) =>
        new InlineKeyboard()
            .text('◀️', `my_orders?page=${page - 1}`)
            .text(`${page}/${countPage}`, 'jimijimi')
            .text('▶️', `my_orders?page=${page + 1}`)
            .row()
            .text('Orqaga ↩️', `back?step=main_menu`),
    allStatisticsTable: (bool, t?: string) =>
        new InlineKeyboard()
            .text(
                `${t == 'today' ? '✅' : ''}` + 'Bugungi',
                `all_statistics?time=today`
            )
            .text(
                `${t == 'yesterday' ? '✅' : ''}` + 'Kechagi',
                `all_statistics?time=yesterday`
            )
            .row()
            .text(
                `${t == 'weekly' ? '✅' : ''}` + 'Haftalik',
                `all_statistics?time=weekly`
            )
            .text(
                `${t == 'monthly' ? '✅' : ''}` + 'Oylik',
                `all_statistics?time=monthly`
            )
            .row()
            .text(
                'Orqaga ↩️',
                `${bool == true ? 'statistics_menu' : 'back?step=main_menu'}`
            ),
    settings: (b) =>
        new InlineKeyboard()
            .text(
                `${b.new_order ? '🚫' : '✅'} ` + 'Yangi Buyurtma',
                'bot_settings?data=new_order'
            )
            .text(
                `${b.ready ? '🚫' : '✅'} ` + 'Tayyor Buyurtma',
                'bot_settings?data=ready'
            )
            .row()
            .text(
                `${b.onway ? '🚫' : '✅'} ` + `Yo'ldagi Buyurtma`,
                'bot_settings?data=onway'
            )
            .text(
                `${b.delivered ? '🚫' : '✅'} ` + 'Yetkazilgan Buyurtma',
                'bot_settings?data=delivered'
            )
            .row()
            .text(
                `${b.canceled ? '🚫' : '✅'} ` + 'Bekor qilingan Buyurtma',
                'bot_settings?data=canceled'
            )
            .text(
                `${b.hold ? '🚫' : '✅'} ` + 'Hold Buyurtma',
                'bot_settings?data=hold'
            )
            .row()
            .text(
                `${b.archived ? '🚫' : '✅'} ` + 'Arxivlangan Buyurtma',
                'bot_settings?data=archived'
            )
            .text(
                `${b.new_product ? '🚫' : '✅'} ` + 'Yangi Maxsulot',
                'bot_settings?data=new_product'
            )
            .row()
            .text(
                `${b.update_product ? '🚫' : '✅'} ` + 'Yangilangan Maxsulot',
                'bot_settings?data=update_product'
            )
            .text(
                `${b.payment ? '🚫' : '✅'} ` + `To'lovlar haqida`,
                'bot_settings?data=payment'
            )
            .row()
            .text(
                `${b.pending ? '🚫' : '✅'} ` + 'Keyin Oladi',
                'bot_settings?data=pending'
            )
            .url(`Admin bilan bog'lanish`, `${bot.admin}`),
    channels: (channels: any[], page, countPage) => {
        var result = [];
        var row = [];

        channels.forEach((channel, i) => {
            row.push({
                text: `${i + 1})  ${channel['chatTitle']}`,
                callback_data: `get_channel?id=${channel['chatId']}`,
            });
            if (i + 1 == channels.length && row.length == 1) result.push(row);
            if (i % 2 != 0) {
                result.push(row);
                row = [];
            }
        });
        result.push([
            {
                text: '◀️',
                callback_data: `get_channels?page=${Number(page) - 1}`,
            },
            { text: `${page}/${countPage}`, callback_data: 'jimijimi' },
            {
                text: '▶️',
                callback_data: `get_channels?page=${Number(page) + 1}`,
            },
        ]);

        return result;
    },

    posts: (posts: any[], page, countPage, channelId) => {
        var result = [];

        posts.forEach((channel, i) => {
            result.push([
                {
                    text: `${i + 1})  ${channel['time']} dagi post`,
                    callback_data: `update_post?id=${channel['uid']}&channel=${channelId}&active=${channel['isActive']}`,
                },
                {
                    text: `🗑`,
                    callback_data: `delete_post?id=${channel['uid']}&channel=${channelId}`,
                },
            ]);
        });
        if (posts.length) {
            result.push([
                {
                    text: '◀️',
                    callback_data: `get_channel?page=${
                        Number(page) - 1
                    }&id=${channelId}`,
                },
                { text: `${page}/${countPage}`, callback_data: 'jimijimi' },
                {
                    text: '▶️',
                    callback_data: `get_channel?page=${
                        Number(page) + 1
                    }&id=${channelId}`,
                },
            ]);
        }

        result.push([
            {
                text: `➕ Qo'shish`,
                callback_data: `add_post?id=${channelId}`,
            },
        ]);

        return result;
    },

    auth_menu: new InlineKeyboard().url(
        `Saytga o'tish`,
        `https://${company.url}/profile/edit`
    ),
};

export default InlineKeyboards;
