type LogContext = Record<string, unknown>;

function write(level: 'info' | 'error', event: string, context?: LogContext) {
  const line = { level, event, ...context, timestamp: new Date().toISOString() };
  const out = level === 'error' ? console.error : console.log;
  out(JSON.stringify(line));
}

export const logger = {
  info: (event: string, context?: LogContext) => write('info', event, context),
  error: (event: string, context?: LogContext) => write('error', event, context),
};
