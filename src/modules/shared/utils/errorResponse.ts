export default class ErrorResponse extends Error {
    public status: number;
    public message: string;

    constructor(status: number, message: string) {
        if (message.includes('[{')) {
            let newMessage = '';
            JSON.parse(message).forEach((e) => {
                if (e.constraints) {
                    for (const [key, value] of Object.entries(e.constraints)) {
                        newMessage += value + '! ';
                    }

                    message = newMessage;
                } else if (e.property) {
                    for (const [key, value] of Object.entries(e)) {
                        newMessage = value + ' xato kiritilgan!';
                    }

                    message = newMessage;
                }
            });
        }
        super(message);
        this.status = status;
        this.message = message;
    }
}
