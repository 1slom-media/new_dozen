import { Expo } from 'expo-server-sdk';
import ExpoService from '../../expo/expo.service';

const expo = new Expo();
const expoService = new ExpoService();

export const notificationPusher = async (title: string, m: string = '') => {
    const operators = await expoService.getTokens();

    if (operators.length) {
        operators.forEach((operator) => {
            // Create the message payload
            const message = {
                to: operator.token,
                // sound: 'default',
                title,
                body: m,
            };

            // Send the notification
            const chunks = expo.chunkPushNotifications([message]);
            (async () => {
                for (const chunk of chunks) {
                    try {
                        const receipts = await expo.sendPushNotificationsAsync(
                            chunk
                        );
                        console.log(receipts);
                    } catch (error) {
                        console.error(error);
                    }
                }
            })();
        });
    }
};
