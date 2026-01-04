export const useLogger = () => {
  return {
    log(...args: any[]) {
      console.log('DEBUG', ...args)
    },

    info(...args: any[]) {
      console.log('INFO', ...args)
    },

    warn(...args: any[]) {
      console.warn('WARNING', ...args)
    },

    error(...args: any[]) {
      console.error('ERROR', ...args)
    },
  }
}
