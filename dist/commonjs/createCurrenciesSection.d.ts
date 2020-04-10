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
}
export declare enum EActions {
    SET_CURRENCY = "CURRENCIES__SET_CURRENCY",
    UPDATE_REQUEST = "CURRENCIES__UPDATE_REQUEST",
    UPDATE_RESPONSE = "CURRENCIES__UPDATE_RESPONSE",
    UPDATE_RESPONSE_SAVE = "CURRENCIES__UPDATE_RESPONSE_SAVE",
    UPDATE_FAIL = "CURRENCIES__UPDATE_FAIL",
    CURRENCIES_LOADED = "CURRENCIES__CURRENCIES_LOADED"
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
