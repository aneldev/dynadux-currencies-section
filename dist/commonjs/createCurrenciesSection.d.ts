import { ICreateStoreAPI } from "dynadux";
import { DynaCurrencies } from "dyna-currencies/dist/esNext";
import { IDynaPrice } from "dyna-interfaces";
import { IDynaLabelCurrency } from "dyna-currencies/src/DynaCurrencies";
export interface ICreateCurrenciesSectionConfig {
    store: ICreateStoreAPI;
    sectionName: string;
    defaultCurrency: string;
    getCurrenciesServiceDynaNodeAddress: string;
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
    UPDATE_FAIL = "CURRENCIES__UPDATE_FAIL",
    CURRENCIES_LOADED = "CURRENCIES__CURRENCIES_LOADED"
}
export declare const createCurrenciesSection: ({ store, sectionName, defaultCurrency, getCurrenciesServiceDynaNodeAddress, updateIfOldenThanMinutes, }: ICreateCurrenciesSectionConfig) => {
    readonly currency: string;
    updateCurrencies: () => void;
    convert: (value: number, sourceCurrency: string, round?: boolean) => number | null;
    convertDynaPrice: (price: IDynaPrice) => IDynaPrice | null;
    convertToLabel: (value: number, sourceCurrency: string) => IDynaLabelCurrency | null;
};
