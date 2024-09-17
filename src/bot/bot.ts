import parseUrl from 'url-parse';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { Router } from '@grammyjs/router';

import { bot as botConfig, server } from '../config/conf';
import BotUsersController from './controllers/bot.users.controller';
import UserService from '../modules/user/user.service';
import messages from './assets/messages';
import InlineKeyboards from './assets/inline_keyboard';
import ChannelService from '../modules/channels/channel.service';
import PostService from '../modules/posts/posts.service';
import { SendMessageBySchedules } from '../modules/shared/utils/cron';
import { IUser } from '../modules/user/interface/user.interface';

const bot = new Bot(botConfig.token);

export default class TgBot {
    private userService = new UserService();
    private botUsersController = new BotUsersController();
    private channelService = new ChannelService();
    private postService = new PostService();

    private router = new Router((ctx) => ctx['session'].step);

    public async runBot() {
        const posts = await this.postService.getAllActive();
        SendMessageBySchedules(posts);

        bot.use(
            session({
                initial: () => ({
                    chat_id: null,
                    post_time: null,
                    step: 'idle',
                    post_items: [],
                    type: null,
                }),
            })
        );

        await bot.api.setMyCommands([
            {
                command: 'start',
                description: 'Start the bot',
            },
        ]);

        bot.command('start', async (ctx, next) => {
            try {
                ctx['session'].step = 'idle';
                var user;
                var user_id;
                const chat_id = ctx.msg.chat.id;

                if (
                    ctx.message.text.split(' ')[1] &&
                    ctx.message.text.split(' ')[1].startsWith('productId')
                )
                    return this.botUsersController.sendProductPost(
                        ctx,
                        ctx.message.text
                    );

                if (
                    ctx.message.text.split(' ')[1] &&
                    !ctx.message.text.split(' ')[1].startsWith('productId')
                )
                    user_id = ctx.message.text.split(' ')[1];

                if (user_id) {
                    const oldUser = await this.userService.checkIfUserExists(
                        chat_id
                    );
                    if (oldUser)
                        await this.userService.update(oldUser._id, {
                            telegramID: 0,
                            isBotActive: false,
                        });
                    user = await this.userService.findOne(user_id);
                    if (user) {
                        await this.userService.update(user._id, {
                            telegramID: chat_id,
                            isBotActive: true,
                        });
                        return this.botUsersController.sendMenu(ctx);
                    }
                    return this.botUsersController.sendAuth(ctx);
                }

                user = await this.userService.checkIfUserExists(chat_id);
                if (!user) return this.botUsersController.sendAuth(ctx);

                return this.botUsersController.sendMenu(ctx);
            } catch (err) {
                console.log(err);
                return this.botUsersController.sendAuth(ctx);
            }
        });

        bot.hears(messages.menuMsg, async (ctx) => {
            ctx['session'].step = 'idle';
            const chat_id = ctx.msg.chat.id;

            const user = await this.userService.checkIfUserExists(chat_id);
            if (!user) return this.botUsersController.sendAuth(ctx);
            return this.botUsersController.sendInlineMenu(ctx);
        });

        bot.hears(messages.holdOrders, async (ctx) => {
            ctx['session'].step = 'idle';
            const chat_id = ctx.msg.chat.id;

            const user = await this.userService.checkIfUserExists(chat_id);

            if (!user) return this.botUsersController.sendAuth(ctx);
            return this.botUsersController.sendHoldOrders(ctx, user._id);
        });

        bot.hears(messages.settings, async (ctx) => {
            ctx['session'].step = 'idle';
            const chat_id = ctx.msg.chat.id;

            const user = await this.userService.checkIfUserExists(chat_id);
            if (!user) return this.botUsersController.sendAuth(ctx);
            return this.botUsersController.sendSettings(ctx);
        });

        bot.hears(messages.channels, async (ctx) => {
            ctx['session'].step = 'idle';
            const chat_id = ctx.msg.chat.id;

            const user = await this.userService.checkIfUserExists(chat_id);
            if (!user) return this.botUsersController.sendAuth(ctx);
            return this.botUsersController.sendChannels(ctx);
        });

        bot.on('callback_query:data', async (ctx) => {
            const { pathname: command, query } = parseUrl(
                ctx.callbackQuery.data,
                true
            );

            switch (command) {
                case 'edit_order':
                    try {
                        await this.botUsersController.editOrder(
                            ctx,
                            true,
                            query.id
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'update_order':
                    try {
                        await this.botUsersController.sendHoldOrders(
                            ctx,
                            query.id,
                            query.page,
                            query.order
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'refresh_order':
                    try {
                        await this.botUsersController.editedOrder(
                            ctx,
                            true,
                            query.id
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'info_order':
                    try {
                        await this.botUsersController.infoOrder(
                            ctx,
                            true,
                            query.id
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'edit_status':
                    try {
                        await this.botUsersController.editOrder(
                            ctx,
                            true,
                            query.id,
                            query.status
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'set_block':
                    try {
                        await this.botUsersController.updateStatus(
                            ctx,
                            query.id,
                            query.status
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'reset_block':
                    try {
                        await this.botUsersController.updateStatus(
                            ctx,
                            query.id,
                            query.status
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'my_balance':
                    try {
                        await this.botUsersController.myBalance(ctx, true);
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'statistics_menu':
                    try {
                        await this.botUsersController.statisticsMenu(ctx, true);
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'my_statistics':
                    try {
                        await this.botUsersController.statisticsTable(
                            ctx,
                            true
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'my_payments':
                    try {
                        await this.botUsersController.paymentsTable(ctx, true);
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'my_orders':
                    try {
                        await this.botUsersController.ordersTable(
                            ctx,
                            true,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'my_payment':
                    try {
                        await this.botUsersController.paymentsTable(
                            ctx,
                            true,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'statistics':
                    try {
                        await this.botUsersController.getStatistics(
                            ctx,
                            true,
                            query.time
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'all_statistics':
                    try {
                        await this.botUsersController.getStatistics(
                            ctx,
                            true,
                            query.time,
                            true
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'bot_settings':
                    try {
                        await this.botUsersController.editSettings(
                            ctx,
                            true,
                            query.data
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'get_channels':
                    try {
                        await this.botUsersController.sendChannels(
                            ctx,
                            true,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'get_channel':
                    try {
                        await this.botUsersController.sendPosts(
                            ctx,
                            true,
                            query.id,
                            query.page
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'add_post':
                    try {
                        ctx['session']['step'] = 'post_time';
                        ctx['session'].chat_id = query.id;
                        ctx.reply(
                            `Post yuborish vaqtini jo'nating\n\nNa'muna: 09:30`
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'reset_post':
                    try {
                        ctx['session'].step = 'post_time';
                        ctx.reply(
                            `Post yuborish vaqtini jo'nating\n\nNa'muna: 09:30`
                        );
                        ctx['session'].post_time = null;
                        ctx['session'].type = null;
                        ctx['session'].post_items = [];
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'set_post':
                    try {
                        ctx['session'].step = 'idle';
                        const channel = await this.channelService.getOne(
                            ctx['session'].chat_id
                        );
                        await this.postService.create({
                            channelId: channel._id,
                            postItems: ctx['session'].post_items,
                            chatId: Number(ctx['session'].chat_id),
                            time: ctx['session'].post_time,
                            type: ctx['session'].type,
                        });
                        ctx.reply('Tabriklaymiz postingiz tasdiqlandi!');
                        ctx['session'].post_time = null;
                        ctx['session'].type = null;
                        ctx['session'].post_items = [];
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'delete_post':
                    try {
                        await this.postService.delete(Number(query.id));
                        await this.botUsersController.sendPosts(
                            ctx,
                            true,
                            query.channel
                        );
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case 'back':
                    switch (query.step) {
                        case 'main_menu':
                            try {
                                await this.botUsersController.sendInlineMenu(
                                    ctx,
                                    true
                                );
                            } catch (error) {
                                console.log(error);
                            }
                            break;
                        case 'edited_order':
                            try {
                                await this.botUsersController.editedOrder(
                                    ctx,
                                    true,
                                    query.id
                                );
                            } catch (error) {
                                console.log(error);
                            }
                            break;
                    }
                    break;

                default:
                    break;
            }
        });

        bot.use(this.router);

        this.router.route('post_time', async (ctx) => {
            try {
                await this.botUsersController.setPostTime(ctx, ctx.msg.text);
                ctx['session'].step = 'post';
                ctx.reply('Postni yuboring');
                ctx['session'].post_items = [];
            } catch (error) {
                console.log(error.message);
                await ctx.reply(messages.wrongTimeMsg, {
                    parse_mode: 'HTML',
                });
            }
        });

        this.router.route('post', async (ctx) => {
            try {
                if (ctx['session'].post_items.length == 0) {
                    await ctx.reply(`Postni tasdiqlaysizmi ?`, {
                        parse_mode: 'HTML',
                        reply_markup: InlineKeyboards.post_checker,
                    });
                }

                if (ctx.message.photo) {
                    ctx['session'].type = 'media';
                    ctx['session'].post_items.push({
                        type: 'photo',
                        media: ctx.message.photo[0].file_id,
                    });
                }
                if (ctx.message.video) {
                    ctx['session'].type = 'media';
                    ctx['session'].post_items.push({
                        type: 'video',
                        media: ctx.message.video.file_id,
                    });
                }
                if (ctx.message.caption) {
                    ctx['session'].post_items[0].caption = ctx.message.caption;
                    ctx['session'].post_items[0]['parse_mode'] = 'HTML';
                }
                if (ctx.message.text) {
                    ctx['session'].post_items.push(ctx.message.text);
                    ctx['session'].type = 'text';
                }
            } catch (error) {
                console.log(error.message);
            }
        });

        bot.use(async (ctx) => {
            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'member'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu guruhga Botni qo'shdingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu guruhga Botni qo'shdingiz !`,
                        { parse_mode: 'HTML' }
                    );
                const user = await this.userService.checkIfUserExists(
                    ctx?.update?.my_chat_member?.from?.id
                );

                await this.channelService.create({
                    chatId: ctx?.update?.my_chat_member?.chat.id,
                    chatTitle: ctx?.update?.my_chat_member?.chat['title'],
                    user: user._id,
                    chatLink: ctx?.update?.my_chat_member?.chat['username'],
                });
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'left'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu guruhdan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu guruhdan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );

                const user = await this.userService.checkIfUserExists(
                    ctx?.update?.my_chat_member?.from?.id
                );
                await this.channelService.delete(
                    ctx?.update?.my_chat_member?.chat.id,
                    user?._id
                );
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status ==
                'administrator'
            ) {
                ctx.api.sendMessage(
                    ctx?.update?.my_chat_member?.from?.id,
                    `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu kanaliga Botni qo'shdingiz !`,
                    { parse_mode: 'HTML' }
                );
                const user = await this.userService.checkIfUserExists(
                    ctx?.update?.my_chat_member?.from?.id
                );

                await this.channelService.create({
                    chatId: ctx?.update?.my_chat_member?.chat.id,
                    chatTitle: ctx?.update?.my_chat_member?.chat['title'],
                    user: user._id,
                    chatLink: ctx?.update?.my_chat_member?.chat['username'],
                });
            }

            if (
                ctx?.update?.my_chat_member?.new_chat_member?.status == 'kicked'
            ) {
                if (ctx?.update?.my_chat_member?.chat['username']) {
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<a href="t.me/${ctx?.update?.my_chat_member?.chat['username']}"><b>${ctx?.update?.my_chat_member?.chat['title']}</b></a>" ushbu kanaldan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );
                } else
                    ctx.api.sendMessage(
                        ctx?.update?.my_chat_member?.from?.id,
                        `Siz "<b>${ctx?.update?.my_chat_member?.chat['title']}</b>" ushbu kanaldan Botni chiqarib yubordingiz !`,
                        { parse_mode: 'HTML' }
                    );

                const user = await this.userService.checkIfUserExists(
                    ctx?.update?.my_chat_member?.from?.id
                );
                await this.channelService.delete(
                    ctx?.update?.my_chat_member?.chat.id,
                    user._id
                );
            }
        });

        bot.catch((err) => {
            const ctx = err.ctx;
            console.error(
                `Error while handling update ${ctx.update.update_id}:`
            );
            const e = err.error;
            if (e instanceof GrammyError) {
                console.error('Error in request:', e.description);
            } else if (e instanceof HttpError) {
                console.error('Could not contact Telegram:', e);
            } else {
                console.error('Unknown error:', e);
            }
        });

        bot.use(this.router);

        bot.start();
    }

    public async sendNewOrder(chatId: number, order: any) {
        try {
            if (chatId) {
                await bot.api.sendMessage(chatId, messages.newOrderMsg(order), {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: InlineKeyboards.send_order(order),
                    },
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendMessage(chatId: number, message: string) {
        try {
            if (chatId) {
                await bot.api.sendMessage(chatId, message, {
                    parse_mode: 'HTML',
                });
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendBlockedUser(chatId: number, user: IUser) {
        try {
            if (chatId) {
                await bot.api.sendMessage(
                    chatId,
                    `Ushbu ${user.phone} raqamli foydalanuvchi sms kodni 3 marta xato kiritish natijasida bloklandi!`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard:
                                InlineKeyboards.sendBlockedUser(user),
                        },
                    }
                );
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendBlockedUserManySms(chatId: number, user: IUser) {
        try {
            if (chatId) {
                await bot.api.sendMessage(
                    chatId,
                    `Ushbu ${user.phone} raqamli foydalanuvchi sms kodni 3 martadan ko'p sms yuborish natijasida bloklandi!`,
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard:
                                InlineKeyboards.sendBlockedUser(user),
                        },
                    }
                );
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendStreamOrder(chatId: number, order: any) {
        try {
            if (chatId) {
                await bot.api.sendMessage(
                    chatId,
                    messages.newStreamOrderMsg(order),
                    {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard:
                                InlineKeyboards.sendStreamOrder(order),
                        },
                    }
                );
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendUptatedOrder(chatId: number, order: any) {
        try {
            await bot.api.sendMessage(chatId, messages.uptatedOrderMsg(order), {
                parse_mode: 'HTML',
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendUptatedPayment(chatId: number, payment: any) {
        try {
            await bot.api.sendMessage(
                chatId,
                messages.uptatedPaymentMsg(payment),
                {
                    parse_mode: 'HTML',
                }
            );
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendNewProduct(chatId: number, product: any) {
        try {
            let photos = [];
            product.image.forEach((image) =>
                photos.push({ type: 'photo', media: image })
            );
            photos[0]['caption'] = messages.sendNewProduct(product);
            photos[0]['parse_mode'] = 'HTML';

            await bot.api.sendMediaGroup(chatId, photos);
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendUpdatedProduct(chatId: number, product: any, r_price) {
        try {
            await bot.api.sendMessage(
                chatId,
                messages.sendUpdateProduct(product, r_price),
                {
                    parse_mode: 'HTML',
                }
            );
        } catch (error) {
            console.log(error.message);
        }
    }

    public async sendPost(chatId: number, post_Items: any, type: string) {
        try {
            switch (type) {
                case 'media':
                    bot.api.sendMediaGroup(chatId, post_Items);
                    break;
                case 'text':
                    bot.api.sendMessage(chatId, post_Items[0]);
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }
}
