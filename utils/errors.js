let errorLog = [];

export function logError(error) {
    const record = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack
    };
    errorLog.push(record);

    // Ограничим размер, если нужно
    if (errorLog.length > 50) {
        errorLog.shift();
    }
}

export function getErrorLog() {
    return errorLog;
}
