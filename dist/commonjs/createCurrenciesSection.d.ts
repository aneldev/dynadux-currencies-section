import { ICreateStoreAPI } from "dynadux";
import { DynaCurrencies, ICurrencyRates, IDynaLabelCurrency } from "dyna-currencies/dist/commonJs";
import { IDynaPrice, IError } from "dyna-interfaces";
export interface ICreateCurrenciesSectionConfig {
    store: ICreateStoreAPI;
    sectionName: string;
    defaultCurrency: string;
    getCurrencies: () => Promise<ICurrencyRates>;
    updateIfOldenThanMinutes?: number;
}
export interface ICreateCurrenciesSectionState {
    loadState: 'empty' | 'loading' | 'loaded';
    currency: string;
    currencies: DynaCurrencies;
    error: string;
    lastUpdate: Date | null;
    updateRequests: IPromisePayload<ICurrencyRates>[];
}
export declare enum EActions {
    SET_CURRENCY = "CURRENCIES__SET_CURRENCY",
    UPDATE_REQUEST = "CURRENCIES__UPDATE_REQUEST",
    UPDATE_PROMISE_ADD = "CURRENCIES__UPDATE_PROMISE_ADD",
    UPDATE_PROMISES_FULFILL = "CURRENCIES__PROMISES_FULFILL",
    UPDATE_RESPONSE_SAVE = "CURRENCIES__UPDATE_RESPONSE_SAVE",
    UPDATE_RESPONSE_FAILED = "CURRENCIES__UPDATE_RESPONSE_FAILED",
    CURRENCIES_UPDATED = "CURRENCIES__CURRENCIES_UPDATED"
}
export interface IPromisePayload<TData = void> {
    resolve?: (data: TData) => void;
    reject?: (error: IError) => void;
}
export declare const createCurrenciesSection: ({ store, sectionName, defaultCurrency, getCurrencies, updateIfOldenThanMinutes, }: ICreateCurrenciesSectionConfig) => {
    currency: string;
    getCurrencyRates: () => Promise<ICurrencyRates>;
    readonly hasLoadedRates: boolean;
    loadRates: () => Promise<ICurrencyRates>;
    convert: (value: number, sourceCurrency: string, round?: boolean) => number | null;
    convertDynaPrice: (price: IDynaPrice) => IDynaPrice | null;
    convertToLabel: (value: number, sourceCurrency: string) => IDynaLabelCurrency | null;
};
