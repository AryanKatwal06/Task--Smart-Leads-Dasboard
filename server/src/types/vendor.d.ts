declare module 'cors' {
  import type { RequestHandler, CorsOptions } from 'express';
  function cors(options?: CorsOptions): RequestHandler;
  export default cors;
}

declare module 'cookie-parser' {
  import type { RequestHandler } from 'express';
  function cookieParser(secret?: string | string[]): RequestHandler;
  export default cookieParser;
}

declare module 'xss-clean' {
  import type { RequestHandler } from 'express';
  function xssClean(): RequestHandler;
  export default xssClean;
}

declare module 'node-cron';
