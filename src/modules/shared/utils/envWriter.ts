import SettingService from '../../setting/setting.service';

const fs = require('fs');

export async function writeToEnvFile(value: string) {
    const settingsService = new SettingService();

    await settingsService.updateToken(value);
}
