import fs from 'fs';

enum LogLevel {
    DEBUG,
    INFO,
    WARNING,
    ERROR
}

export class LogUtil {
    static logLevel: LogLevel = LogLevel.INFO;
    static logFilePath: string = 'log/app.log';

    static setLogLevel(level: LogLevel) {
        LogUtil.logLevel = level;
    }

    static setLogFilePath(filePath: string) {
        LogUtil.logFilePath = filePath;
    }

    private static getTimeStamp(): string {
        const date = new Date();
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    private static logToFile(level: LogLevel, message: string) {
        const timeStamp = LogUtil.getTimeStamp();
        const logMessage = `[${timeStamp}] [${LogLevel[level]}] ${message}\n`;

        fs.appendFile(LogUtil.logFilePath, logMessage, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    }

    private static logToConsole(level: LogLevel, message: string) {
        const timeStamp = LogUtil.getTimeStamp();
        console.log(`[${timeStamp}] [${LogLevel[level]}] ${message}`);
    }

    static debug(message: string) {
        if (LogUtil.logLevel <= LogLevel.DEBUG) {
            LogUtil.logToFile(LogLevel.DEBUG, message);
            LogUtil.logToConsole(LogLevel.DEBUG, message);
        }
    }

    static info(message: string) {
        if (LogUtil.logLevel <= LogLevel.INFO) {
            LogUtil.logToFile(LogLevel.INFO, message);
            LogUtil.logToConsole(LogLevel.INFO, message);
        }
    }

    static warning(message: string) {
        if (LogUtil.logLevel <= LogLevel.WARNING) {
            LogUtil.logToFile(LogLevel.WARNING, message);
            LogUtil.logToConsole(LogLevel.WARNING, message);
        }
    }

    static error(message: string) {
        if (LogUtil.logLevel <= LogLevel.ERROR) {
            LogUtil.logToFile(LogLevel.ERROR, message);
            LogUtil.logToConsole(LogLevel.ERROR, message);
        }
    }
}