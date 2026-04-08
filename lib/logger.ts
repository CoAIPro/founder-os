export function logError(context: string, error: any, extra?: object) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      context,
      error: error?.message || String(error),
      ...extra
    }))
  }
  
  export function logInfo(context: string, message: string, extra?: object) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      context,
      message,
      ...extra
    }))
  }