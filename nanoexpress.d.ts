/* eslint-disable @typescript-eslint/no-explicit-any */
import { Ajv, Options as AjvOptions } from 'ajv';
import { Readable, Writable } from 'stream';
import {
  AppOptions as AppOptionsBasic,
  HttpRequest as HttpRequestBasic,
  HttpResponse as HttpResponseBasic,
  TemplatedApp as AppTemplatedApp,
  WebSocket as WebSocketBasic
} from 'uWebSockets.js';

declare namespace nanoexpress {
  export interface SwaggerOptions {
    [key: string]: SwaggerOptions | string;
  }
  export interface AppOptions extends AppOptionsBasic {
    https?: {
      key_file_name: string;
      cert_file_name: string;
      passphare: string;
    };
    isSSL?: boolean;
    ajv?: AjvOptions;
    configureAjv(ajv: Ajv): Ajv;
    swagger?: SwaggerOptions;
  }

  export interface HttpRequestHeaders {
    [key: string]: string;
  }
  export interface HttpRequestQueries {
    [key: string]: string;
  }
  export interface HttpRequestParams {
    [key: string]: string;
  }
  export interface HttpRequestBody {
    [key: string]: string | any[];
  }
  export interface HttpRequestCookies {
    [key: string]: string;
  }

  export interface WebSocket extends WebSocketBasic {
    emit(name: string, ...args: any[]): void;

    on(
      event: 'upgrade',
      listener: (req: HttpRequest, res: HttpResponse) => void
    ): void;
    on(event: 'drain', listener: (drain_amount: number) => void): void;
    on(event: 'close', listener: (ws: WebSocket, code: number, message: string) => void): void;
    on(
      event: 'message',
      listener: (message: string | any, isBinary?: boolean) => void
    ): void;

    on(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener?: (...args: any[]) => void): void;
  }
  export interface HttpRequest extends HttpRequestBasic {
    method: string;
    path: string;
    baseUrl: string;
    url: string;
    originalUrl: string;
    headers?: HttpRequestHeaders;
    cookies?: HttpRequestCookies;
    query?: HttpRequestQueries;
    params?: HttpRequestParams;
    body?: string | HttpRequestBody;
    pipe(callback: (pipe: Writable) => void): HttpRequest;
    onAborted(onAborted: () => void): void;
    __response?: HttpResponse;
  }

  export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
    signed?: boolean;
    expires?: number | string;
  }
  export interface HttpResponse extends HttpResponseBasic {
    type(type: string): HttpResponse;
    status(code: number): HttpResponse;
    setHeader(key: string, value: string | number): HttpResponse;
    header(key: string, value: string | number): HttpResponse;
    hasHeader(key: string): HttpResponse;
    removeHeader(key: string): HttpResponse;
    applyHeadersAndStatus(): HttpResponse;
    setHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHeaderValues(name: string, value: string[]): HttpResponse;
    writeHeaders(headers: HttpRequestHeaders): HttpResponse;
    writeHead(code: number, headers: HttpRequestHeaders): HttpResponse;
    redirect(code: number | string, path?: string): HttpResponse;
    send(result: string | { [key: string]: any } | any[]): HttpResponse;
    json(result: { [key: string]: any } | any[]): HttpResponse;
    pipe(
      callback: (pipe: Readable) => void,
      size?: number,
      compressed?: boolean
    ): HttpResponse;
    sendFile(
      filename: string,
      lastModified?: boolean,
      compressed?: boolean
    ): Promise<HttpResponse>;
    setCookie(
      key: string,
      value: string,
      options?: CookieOptions
    ): HttpResponse;
    cookie(key: string, value: string, options?: CookieOptions): HttpResponse;
    hasCookie(key: string): HttpResponse;
    removeCookie(key: string, options?: CookieOptions): HttpResponse;
    __request?: HttpRequest;
    on(event: 'connection', ws: WebSocket): void;
  }

  type HttpRoute = (req: HttpRequest, res: HttpResponse) => nanoexpressApp;

  type MiddlewareRoute = (
    req: HttpRequest,
    res: HttpResponse,
    next?: (err: Error | null | undefined, done: boolean | undefined) => any
  ) => nanoexpressApp;

  export interface AppRoute {
    get: HttpRoute;
    post: HttpRoute;
    put: HttpRoute;
    patch: HttpRoute;
    head: HttpRoute;
    delete: HttpRoute;
    options: HttpRoute;
    trace: HttpRoute;
    any: HttpRoute;
    ws: HttpRoute;
  }

  interface SchemaValue {
    [key: string]: string | SchemaValue;
  }
  interface Schema {
    headers: boolean | SchemaValue;
    cookies: boolean | SchemaValue;
    query: boolean | SchemaValue;
    params: boolean | SchemaValue;
    body: string | boolean | SchemaValue;
    response: boolean | SchemaValue;
  }
  export interface WebSocketOptions {
    compression?: number;
    maxPayloadLength?: number;
    idleTimeout?: number;
    schema?: Schema;
  }
  interface RouteOption {
    schema?: Schema;
    isRaw?: boolean;
    isStrictRaw?: boolean;
    forceRaw?: boolean;
    noMiddleware?: boolean;
    onAborted?: () => any;
  }

  export interface PerRoute {
    callback(req: HttpRequest, res: HttpResponse): any;
    middlewares?: HttpRoute[];
    schema?: Schema;
  }

  export interface AppConfig {
    config: {
      [key: string]: any;
    };
  }

  export interface StaticOptions {
    index?: string;
    addPrettyUrl?: boolean;
    forcePretty?: boolean;
    lastModified?: boolean;
    compressed?: boolean;
  }

  interface validationErrorItems {
    type: string;
    messages: string[];
  }
  export interface validationErrors {
    type: string;
    errors: validationErrorItems;
  }

  interface nanoexpressAppInterface {
    host: string | null;
    port: number | null;
    address: string;

    define(callback: (app: nanoexpressApp) => void): nanoexpressApp;
    use(middleware: MiddlewareRoute): nanoexpressApp;
    use(path: string, middleware: MiddlewareRoute): nanoexpressApp;
    use(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    use(...middlewares: MiddlewareRoute[]): nanoexpressApp;

    use(middleware: PromiseLike<MiddlewareRoute>): PromiseLike<any>;
    use(
      path: string,
      middleware: PromiseLike<MiddlewareRoute>
    ): PromiseLike<any>;
    use(
      path: string,
      ...middlewares: PromiseLike<MiddlewareRoute>[]
    ): PromiseLike<any>;
    use(...middlewares: PromiseLike<MiddlewareRoute>[]): PromiseLike<any>;

    get(path: string, callback: HttpRoute): nanoexpressApp;
    get(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    get(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    get(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    post(path: string, callback: HttpRoute): nanoexpressApp;
    post(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    post(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    post(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    put(path: string, callback: HttpRoute): nanoexpressApp;
    put(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    put(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    put(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    patch(path: string, callback: HttpRoute): nanoexpressApp;
    patch(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    patch(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    patch(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    del(path: string, callback: HttpRoute): nanoexpressApp;
    del(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    del(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    del(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    options(path: string, callback: HttpRoute): nanoexpressApp;
    options(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    options(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    options(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    any(path: string, callback: HttpRoute): nanoexpressApp;
    any(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    any(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    any(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    head(path: string, callback: HttpRoute): nanoexpressApp;
    head(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    head(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    head(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    trace(path: string, callback: HttpRoute): nanoexpressApp;
    trace(
      path: string,
      options: RouteOption,
      callback: HttpRoute
    ): nanoexpressApp;
    trace(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    trace(
      path: string,
      options: RouteOption,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    ws(path: string, ...middlewares: MiddlewareRoute[]): nanoexpressApp;
    ws(
      path: string,
      options: WebSocketOptions,
      ...middlewares: MiddlewareRoute[]
    ): nanoexpressApp;

    webRTCServer(): nanoexpressApp;
    webRTCServer(path: string): nanoexpressApp;
    webRTCServer(path: string, options: WebSocketOptions): nanoexpressApp;

    publish(
      topic: string,
      message: string,
      isBinary?: boolean,
      compress?: boolean
    ): nanoexpressApp;

    listen(port: number, host?: string): Promise<nanoexpressApp>;
    close(): boolean;
    setErrorHandler(
      errorHandlerCallback: (
        err: Error,
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setNotFoundHandler(
      notFoundHandlerCallback: (
        req: HttpRequest,
        res: HttpResponse
      ) => HttpResponse
    ): nanoexpressApp;
    setValidationErrorHandler(
      validationErrorHandlerCallback: (
        errors: validationErrors,
        req: HttpRequest,
        res: HttpResponse
      ) => any
    ): nanoexpressApp;
    config: AppConfig;
  }

  export interface nanoexpressApp
    extends Omit<AppTemplatedApp, keyof nanoexpressAppInterface>,
      nanoexpressAppInterface {}
}

declare function nanoexpress(
  options?: nanoexpress.AppOptions
): nanoexpress.nanoexpressApp;

export = nanoexpress;
