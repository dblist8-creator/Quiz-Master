const PREFIX = "[QuizBackend]";

const log = (level: string, color: string, message: string, ...args: any[]) => {
  console.log(`%c${PREFIX} ${level}: ${message}`, `color: ${color}; font-weight: bold;`, ...args);
};

export const logger = {
  info: (message: string, ...args: any[]) => log("INFO", "#259cfb", message, ...args),
  warn: (message: string, ...args: any[]) => log("WARN", "#f59e0b", message, ...args),
  error: (message: string, ...args: any[]) => log("ERROR", "#f43f5e", message, ...args),
  success: (message: string, ...args: any[]) => log("SUCCESS", "#10b981", message, ...args),
};
