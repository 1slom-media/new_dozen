import { Keyboard } from 'grammy';
import messages from './messages';

const Keyboards = {
    main_menu: new Keyboard()
        .text(messages.menuMsg)
        .text(messages.settings)
        .row()
        .text(messages.holdOrders)
        .text(messages.channels)
        .resized(),
};

export default Keyboards;
