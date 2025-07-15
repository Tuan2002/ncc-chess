import { LocalStorage } from "@/constants/local-storage";
import { AsyncLocalStorage } from "async_hooks";
import { Request, RequestHandler, Response } from "express";

const RequestStorage = new AsyncLocalStorage<Map<string, Request>>();
export function asyncLocalStorageMiddleware(): RequestHandler {
    return (req: Request, res: Response, next: Function) => {
        RequestStorage.run(new Map(), () => {
            RequestStorage.getStore()?.set(LocalStorage.REQUEST_STORE, req);
            next();
        });
    };
}
export { RequestStorage }