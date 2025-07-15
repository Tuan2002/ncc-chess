import winston from 'winston';
import path from 'path';

const appRoot = process.cwd();
// Define a custom log message format
const customFormat = winston.format.printf((info) => {
    return `${info.timestamp} ${info.level.toUpperCase()} : ${info.message}`;
});

// Define a format to exclude log messages with 'error' level
const excludeErrorLevel = winston.format((info) => {
    if (info.level === 'error') {
        return false; // Exclude error messages from this format
    }
    return info; // Include other log messages
});

// Define a format for info-level log messages displayed on the console
const infoConsoleFormat = winston.format.combine(
    winston.format.timestamp(), // Add a timestamp to log messages
    winston.format.splat(), // Allow message formatting with placeholders
    customFormat // Use the custom log message format defined earlier
);

// Define a format for info-level log messages written to "common.log" file
const infoLogFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    excludeErrorLevel(), // Exclude error messages from this format
    customFormat
);

// Define a format for error-level log messages written to "error.log" file
const errorLogFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.splat(),
    customFormat
);

// Create a Winston logger instance with specified transports
const logger = winston.createLogger({
    transports: [
        // File transport: Write info-level log messages to "server.log" file
        new winston.transports.File({ filename: path.resolve(appRoot, 'logs', 'server.log'), level: "info", format: infoLogFormat }),
        // File transport: Write error-level log messages to "errors.log" file
        new winston.transports.File({ filename: path.resolve(appRoot, 'logs', 'errors.log'), level: "error", format: errorLogFormat })
    ]
});
export default logger;