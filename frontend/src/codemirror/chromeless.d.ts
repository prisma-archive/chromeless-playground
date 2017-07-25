declare function uploadScreenshot(data: string): Promise<string>

declare class Chromeless<T extends any> {
  constructor(options?: ChromelessOptions, copyInstance?: Chromeless<any>);

  readonly [Symbol.toStringTag]: 'Promise';

  then<U>(onFulfill: (value: T) => U | PromiseLike<U>, onReject?: (error: any) => U | PromiseLike<U>): Promise<U>;

  catch<U>(onrejected?: (reason: any) => U | PromiseLike<U>): Promise<U>;

  goto(url: string): Chromeless<T>;

  click(selector: string): Chromeless<T>;

  wait(timeout: number): Chromeless<T>;
  wait(selector: string): Chromeless<T>;
  wait(fn: (...args: any[]) => boolean, ...args: any[]): Chromeless<T>;

  focus(selector: string): Chromeless<T>;

  press(keyCode: number, count?: number, modifiers?: any): Chromeless<T>;

  type(input: string, selector?: string): Chromeless<T>;

  back(): Chromeless<T>;

  forward(): Chromeless<T>;

  refresh(): Chromeless<T>;

  mousedown(): Chromeless<T>;

  mouseup(): Chromeless<T>;

  mouseover(): Chromeless<T>;

  scrollTo(x: number, y: number): Chromeless<T>;

  viewport(width: number, height: number): Chromeless<T>;

  evaluate<U extends any>(fn: (...args: any[]) => void, ...args: any[]): Chromeless<U>;

  inputValue(selector: string): Chromeless<string>;

  exists(selector: string): Chromeless<boolean>;

  screenshot(): Chromeless<string>;

  /**
   * Get the cookies for the current url
   */
  cookiesGet(): Chromeless<Cookie[] | null>;
  /**
   * Get a specific cookie for the current url
   * @param name
   */
  cookiesGet(name: string): Chromeless<Cookie | null>;
  /**
   * Get a specific cookie by query. Not implemented yet
   * @param query
   */
  cookiesGet(query: CookieQuery): Chromeless<Cookie[] | null>;

  cookiesGetAll(): Chromeless<Cookie[]>;

  cookiesSet(name: string, value: string): Chromeless<T>;
  cookiesSet(cookie: Cookie): Chromeless<T>;
  cookiesSet(cookies: Cookie[]): Chromeless<T>;

  cookiesClear(name: string): Chromeless<T>;

  cookiesClearAll(): Chromeless<T>;

  end(): Promise<void>;
}

declare interface RemoteOptions {
  functionName?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

declare interface CDPOptions {
  host?: string;
  port?: number;
  secure?: boolean;
}

declare interface ChromelessOptions {
  debug?: boolean;
  closeTab?: boolean;
  waitTimeout?: number;
  viewport?: {
    width?: number;
    height?: number;
    scale?: number;
  };
  cdp?: CDPOptions;
  remote?: RemoteOptions | boolean;
}

declare interface Cookie {
  url?: string;
  domain?: string;
  name: string;
  value: string;
  path?: string;
  expires?: number;
  size?: number;
  httpOnly?: boolean;
  secure?: boolean;
  session?: boolean;
}

declare interface CookieQuery {
  name: string;
  path?: string;
  expires?: number;
  size?: number;
  httpOnly?: boolean;
  secure?: boolean;
  session?: boolean;
}

