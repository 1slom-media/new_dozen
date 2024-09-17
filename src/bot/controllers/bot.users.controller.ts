import messages from '../assets/messages';
import InlineKeyboards from '../assets/inline_keyboard';
import OrderService from '../../modules/order/order.service';
import Keyboards from '../assets/keyboard';
import UserService from '../../modules/user/user.service';
import StreamService from '../../modules/stream/stream.service';
import BotSettingsService from '../../modules/botSettings/botSettings.service';
import PaymentService from '../../modules/payment/payment.service';
import ProductService from '../../modules/product/product.service';
import { company } from '../../config/conf';
import ChannelService from '../../modules/channels/channel.service';
import PostService from '../../modules/posts/posts.service';
import stringTimeValidator from '../utils/stringTimeValidator';
import { InlineKeyboard } from 'grammy';

export default class BotUsersController {
    private orderService = new OrderService();
    private userService = new UserService();
    private streamService = new StreamService();
    private botSettingsService = new BotSettingsService();
    private paymentService = new PaymentService();
    private productService = new ProductService();
    private channelSercvice = new ChannelService();
    private postService = new PostService();

    public sendInlineMenu = async (ctx, edit: boolean = false) => {
        try {
            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    messages.menuMsg,
                    {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.inline_menu,
                    }
                );
            else
                await ctx.reply(messages.menuMsg, {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.inline_menu,
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendHoldOrders = async (
        ctx,
        id: string,
        page: number = 1,
        order?: string
    ) => {
        try {
            var user;
            if (ctx.update?.message)
                user = await this.userService.checkIfUserExists(
                    ctx.update.message.chat.id
                );
            if (ctx.update?.callback_query)
                user = await this.userService.checkIfUserExists(
                    ctx.update.callback_query.from.id
                );

            if (page == 0)
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            if (order) {
                await this.orderService.updateOrder(order, {
                    status: 'new',
                    isTaken: false,
                });
            }

            const orders = await this.orderService.userStatistics(
                user._id,
                'order',
                'pending',
                page,
                6
            );

            if (page > 1 && orders['countPage'] < page) {
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            }
            if (order && orders['orders'].length == 0)
                ctx.api.deleteMessage(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id
                );
            if (page == 1 && orders['orders'].length == 0) {
                return ctx.reply(`Hozirda sizda bunday buyurtmalar yo'q`);
            }

            if (order) {
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    messages.sendHoldProducts,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.holdOrders_menu(
                                orders['orders'],
                                page,
                                orders['countPage'],
                                id
                            ),
                        },
                    }
                );
            } else {
                await ctx.reply(messages.sendHoldProducts, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.holdOrders_menu(
                            orders['orders'],
                            page,
                            orders['countPage'],
                            id
                        ),
                    },
                });
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendSettings = async (ctx, edit: boolean = false) => {
        try {
            const user = await this.userService.checkIfUserExists(
                ctx.update.message.chat.id
            );
            await this.botSettingsService.create(user._id);
            const settings = await this.botSettingsService.getOne(user._id);
            await ctx.reply(`⚙️ Bot Sozlamalari`, {
                parse_mode: 'HTML',
                reply_markup: InlineKeyboards.settings(settings),
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendChannels = async (ctx, edit: boolean = false, page = 1) => {
        try {
            if (page == 0)
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            var user;
            if (ctx.update?.message)
                user = await this.userService.checkIfUserExists(
                    ctx.update.message.chat.id
                );
            if (ctx.update?.callback_query)
                user = await this.userService.checkIfUserExists(
                    ctx.update.callback_query.from.id
                );
            const { channels, pageCount } = await this.channelSercvice.getAll(
                user._id,
                page
            );
            if (page > 1 && pageCount < page) {
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            }
            if (page == 1 && channels.length == 0)
                return ctx.reply(
                    `Sizda hali hech qanday kanal yoki gruppa yo'q`
                );

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    `🗒 kanal va guruhlar ro'yxati`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.channels(
                                channels,
                                page,
                                pageCount
                            ),
                        },
                    }
                );
            else
                await ctx.reply(`🗒 kanal va guruhlar ro'yxati`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.channels(
                            channels,
                            page,
                            pageCount
                        ),
                    },
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendPosts = async (
        ctx,
        edit: boolean = false,
        channelId: string,
        page: number = 1
    ) => {
        try {
            if (page == 0)
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            const channel = await this.channelSercvice.getOne(
                Number(channelId)
            );
            const { posts, pageCount } = await this.postService.getAll(
                channel._id.toString(),
                page
            );

            if (page > 1 && pageCount < page) {
                return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                    text: '❗️ Bu oxirgi sahifa',
                });
            }

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    `"<b>${channel.chatTitle}</b>" kanaldagi postlar`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.posts(
                                posts,
                                page,
                                pageCount,
                                channel.chatId
                            ),
                        },
                    }
                );
            else
                await ctx.reply(
                    `"<b>${channel.chatTitle}</b>" kanaldagi postlar`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: InlineKeyboards.posts(
                                posts,
                                page,
                                pageCount,
                                channel.chatId
                            ),
                        },
                    }
                );
        } catch (err) {
            console.log(err.message);
        }
    };

    public editSettings = async (
        ctx,
        edit: boolean = false,
        status?: string
    ) => {
        try {
            const user = await this.userService.checkIfUserExists(
                ctx.callbackQuery.message.chat.id
            );
            const oldSettings = await this.botSettingsService.getOne(user._id);
            const settings = await this.botSettingsService.update(user._id, {
                new_order:
                    status == 'new_order'
                        ? !oldSettings.new_order
                        : oldSettings.new_order,
                archived:
                    status == 'archived'
                        ? !oldSettings.archived
                        : oldSettings.archived,
                canceled:
                    status == 'canceled'
                        ? !oldSettings.canceled
                        : oldSettings.canceled,
                delivered:
                    status == 'delivered'
                        ? !oldSettings.delivered
                        : oldSettings.delivered,
                hold: status == 'hold' ? !oldSettings.hold : oldSettings.hold,
                new_product:
                    status == 'new_product'
                        ? !oldSettings.new_product
                        : oldSettings.new_product,
                onway:
                    status == 'onway' ? !oldSettings.onway : oldSettings.onway,
                payment:
                    status == 'payment'
                        ? !oldSettings.payment
                        : oldSettings.payment,
                pending:
                    status == 'pending'
                        ? !oldSettings.pending
                        : oldSettings.pending,
                ready:
                    status == 'ready' ? !oldSettings.ready : oldSettings.ready,
                update_product:
                    status == 'update_product'
                        ? !oldSettings.update_product
                        : oldSettings.update_product,
            });
            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    `⚙️ Bot Sozlamalari`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.settings(settings),
                    }
                );
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendMenu = async (ctx) => {
        try {
            await ctx.reply(messages.start_message(ctx), {
                parse_mode: 'HTML',
                reply_markup: Keyboards.main_menu,
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendProductPost = async (ctx, productId) => {
        try {
            const product = await this.productService
                .getProductWithVariantId(productId.split('=')[1])
                .catch((err) => ctx.reply(err.message));

            console.log(product);

            let description = product.description.replaceAll('<p>', '<b>');
            description = description.replaceAll('</p>', '</b>\n');
            description = description.replaceAll('<br>', '\n');

            await ctx.api.sendPhoto(ctx.update.message.chat.id, product.image, {
                reply_markup: new InlineKeyboard().url(
                    'Buyurtma berish',
                    `https://baroka.uz/uz/shop/${product.id}`
                ),
                parse_mode: 'HTML',
                caption: description,
            });
        } catch (err) {
            console.log(err.message);
        }
    };

    public sendAuth = async (ctx, edit: boolean = false) => {
        if (edit)
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.authMsg,
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.auth_menu,
                }
            );
        else
            await ctx.reply(messages.authMsg, {
                parse_mode: 'HTML',
                reply_markup: InlineKeyboards.auth_menu,
            });
    };

    public editOrder = async (
        ctx,
        edit: boolean = false,
        id: string,
        status?: string
    ) => {
        try {
            if (status)
                await this.orderService.updateOrderAdmin(id, {
                    status: status,
                });
            const order = await this.orderService.getOneOrder(id);

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    messages.newOrderMsg(order),
                    {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.edit_status(
                            order.status,
                            order._id
                        ),
                    }
                );
            else
                await ctx.reply(messages.newOrderMsg(order), {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.edit_status(
                        order.status,
                        order._id
                    ),
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public updateStatus = async (ctx, id: string, status?: string) => {
        try {
            console.log(id, status);
            const user = await this.userService.update(id, {
                status: Number(status),
            });

            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                `Ushbu ${user.phone} raqamli foydalanuvchi sms kodni 3 marta xato kiritish natijasida bloklandi!`,
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.sendBlockedUser(user),
                    },
                }
            );
        } catch (err) {
            console.log(err.message);
        }
    };

    public editStreamOrder = async (ctx, edit: boolean = false, id: string) => {
        try {
            const order = await this.orderService.getOneOrder(id);
            const newOrder = await this.orderService.updateOrderAdmin(id, {
                status: 'new',
                takenById: '',
                isTaken: false,
            });

            if (edit)
                await ctx.api.editMessageText(
                    ctx.callbackQuery.message.chat.id,
                    ctx.callbackQuery.message.message_id,
                    messages.newOrderMsg(newOrder),
                    {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.edit_status(
                            order.status,
                            order._id
                        ),
                    }
                );
            else
                await ctx.reply(messages.newOrderMsg(order), {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.edit_status(
                        order.status,
                        order._id
                    ),
                });
        } catch (err) {
            console.log(err.message);
        }
    };

    public myBalance = async (ctx, edit: boolean = false) => {
        const user = await this.userService.checkIfUserExists(
            ctx.callbackQuery.message.chat.id
        );

        if (edit)
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.myBalance(user),
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.my_balance,
                }
            );
        else
            await ctx.reply(messages.myBalance(user), {
                parse_mode: 'HTML',
                reply_markup: InlineKeyboards.my_balance,
            });
    };

    public editedOrder = async (ctx, edit: boolean = false, id: string) => {
        const order = await this.orderService.getOneOrder(id);

        if (edit)
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.newOrderMsg(order),
                {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.send_order(order),
                    },
                }
            );
        else
            await ctx.reply(messages.newOrderMsg(order), {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: InlineKeyboards.send_order(order),
                },
            });
    };

    public infoOrder = async (ctx, edit: boolean = false, id: string) => {
        const order = await this.orderService.getOneOrder(id);

        await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
            text: messages.infoOrder(order),
            show_alert: true,
            parse_mode: 'HTML',
        });
    };

    public statisticsMenu = async (ctx, edit: boolean = false) => {
        const user = await this.userService.checkIfUserExists(
            ctx.callbackQuery.message.chat.id
        );

        if (user.isAdmin) {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.statistics_menu,
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.statisticsMenu,
                }
            );
        } else {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.statistics_menu,
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.statisticsTable(false),
                }
            );
        }
    };

    public statisticsTable = async (ctx, edit: boolean = false) => {
        await ctx.api.editMessageText(
            ctx.callbackQuery.message.chat.id,
            ctx.callbackQuery.message.message_id,
            messages.statistics_menu,
            {
                parse_mode: 'HTML',
                reply_markup: InlineKeyboards.statisticsTable(true),
            }
        );
    };

    public paymentsTable = async (
        ctx,
        edit: boolean = false,
        page: number = 1
    ) => {
        page = Number(page);

        const user = await this.userService.checkIfUserExists(
            ctx.callbackQuery.message.chat.id
        );

        if (page == 0)
            return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: '❗️ Bu oxirgi sahifa',
            });
        const payments = await this.paymentService.getAll(
            user._id.toString(),
            page,
            3
        );

        if (!payments.countPage)
            return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: `❗️ To'lovlar yo'q`,
            });

        if (payments.countPage < page) {
            await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: '❗️ Bu oxirgi sahifa',
            });
        } else
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.payments(payments.payments),
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.paymentsTable(
                        page,
                        payments.countPage != 0 ? payments.countPage : 1
                    ),
                }
            );
    };

    public ordersTable = async (
        ctx,
        edit: boolean = false,
        page: number = 1
    ) => {
        page = Number(page);

        const user = await this.userService.checkIfUserExists(
            ctx.callbackQuery.message.chat.id
        );

        if (page == 0)
            return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: '❗️ Bu oxirgi sahifa',
            });

        const orders = await this.orderService.getAllReferalOrders(
            user._id,
            page,
            3
        );

        if (!orders.countPage)
            return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: `❗️ Sizda buyurtmalar yo'q`,
            });

        if (orders.countPage < page) {
            await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
                text: '❗️ Bu oxirgi sahifa',
            });
        } else
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.orders(orders.orders),
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.myOrdersTable(
                        page,
                        orders.countPage != 0 ? orders.countPage : 1
                    ),
                }
            );
    };

    public getStatistics = async (
        ctx,
        edit: boolean = false,
        day: string = 'today',
        isAll?: boolean
    ) => {
        let userOrders;
        let nowDate = new Date();
        let lastDate;
        let userOrderCount = {
            visits_count: 0,
            new: 0,
            ready: 0,
            onway: 0,
            delivered: 0,
            canceled: 0,
            hold: 0,
            archived: 0,
        };
        const user = await this.userService.checkIfUserExists(
            ctx.callbackQuery.message.chat.id
        );

        const countStreamVisit = await this.streamService.findByUserId(
            user._id
        );

        let sum = 0;
        countStreamVisit.forEach((t) => (sum += t.visits_count));
        userOrderCount.visits_count = sum;

        switch (day) {
            case 'monthly':
                lastDate = new Date(new Date(nowDate).getTime() - 2592000000); //a month

                if (!isAll) {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate,
                        user._id
                    );
                } else {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate
                    );
                }
                break;
            case 'weekly':
                lastDate = new Date(new Date(nowDate).getTime() - 604800000); //a week

                if (!isAll) {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate,
                        user._id
                    );
                } else {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate
                    );
                }
                break;
            case 'yesterday':
                nowDate = new Date(
                    new Date(nowDate).getTime() -
                        new Date(nowDate).getHours() * 3600000
                );
                lastDate = new Date(new Date(nowDate).getTime() - 86400000);

                if (!isAll) {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate,
                        user._id
                    );
                } else {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate
                    );
                }

                break;
            case 'today':
                lastDate = new Date(
                    new Date(nowDate).getTime() -
                        new Date(nowDate).getHours() * 3600000
                );

                if (!isAll) {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate,
                        user._id
                    );
                } else {
                    userOrders = await this.orderService.getOrderSlice(
                        nowDate,
                        lastDate
                    );
                }

                break;
        }

        userOrders.forEach((order) => {
            userOrderCount[order.status] += 1;
        });

        if (!isAll) {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.statistics(userOrderCount),
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.statisticsTable(
                        user.isAdmin,
                        day
                    ),
                }
            );
        } else {
            await ctx.api.editMessageText(
                ctx.callbackQuery.message.chat.id,
                ctx.callbackQuery.message.message_id,
                messages.statistics(userOrderCount),
                {
                    parse_mode: 'HTML',
                    reply_markup: InlineKeyboards.allStatisticsTable(
                        user.isAdmin,
                        day
                    ),
                }
            );
        }
    };

    public setPostTime = async (ctx, time) => {
        stringTimeValidator(time);
        ctx.session.post_time = time;
    };
}
