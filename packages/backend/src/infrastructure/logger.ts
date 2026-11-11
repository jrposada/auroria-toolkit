import { RequestContext } from '../services/request-context.ts';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const CONSOLE_METHOD: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug,
  info: console.log,
  warn: console.warn,
  error: console.error,
};

class Logger {
  public static debug(message: string, ...meta: unknown[]): void {
    Logger.log('debug', message, meta);
  }

  public static info(message: string, ...meta: unknown[]): void {
    Logger.log('info', message, meta);
  }

  public static warn(message: string, ...meta: unknown[]): void {
    Logger.log('warn', message, meta);
  }

  public static error(message: string, ...meta: unknown[]): void {
    Logger.log('error', message, meta);
  }

  private static log(level: LogLevel, message: string, meta: unknown[]): void {
    const timestamp = new Date().toISOString();
    const traceId = RequestContext.getTraceId() ?? '-';

    CONSOLE_METHOD[level](
      `${timestamp} [${traceId}] [${level.toUpperCase()}] ${message}`,
      ...meta
    );
  }
}

export default Logger;
