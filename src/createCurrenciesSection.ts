import { ICreateStoreAPI } from "dynadux";
import {
  DynaCurrencies,
  ICurrencyRates,
  IDynaLabelCurrency,
} from "dyna-currencies/dist/commonJs";
import {
  IDynaPrice,
  IError,
} from "dyna-interfaces";

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

export enum EActions {
  SET_CURRENCY = 'CURRENCIES__SET_CURRENCY',        // string, the currency, 3 chars
  UPDATE_REQUEST = 'CURRENCIES__UPDATE_REQUEST',    // IPromisePayload
  UPDATE_RESPONSE = 'CURRENCIES__UPDATE_RESPONSE',  // ICurrencyRates
  UPDATE_FAIL = 'CURRENCIES__UPDATE_FAIL',          // string, the error message
  CURRENCIES_LOADED = 'CURRENCIES__CURRENCIES_LOADED',          // void
}

export interface IPromisePayload<TData = void> {
  resolve?: (data: TData) => void;
  reject?: (error: IError) => void;
}

export const createCurrenciesSection = (
  {
    store,
    sectionName,
    defaultCurrency,
    getCurrencies,
    updateIfOldenThanMinutes,
  }: ICreateCurrenciesSectionConfig
) => {
  const section = store.createSection<ICreateCurrenciesSectionState>({
    section: sectionName,
    initialState: {
      loadState: 'empty',
      currency: defaultCurrency,
      currencies: new DynaCurrencies(),
      error: '',
      lastUpdate: null,
    },
    reducers: {
      [EActions.SET_CURRENCY]: ({payload}) => {
        const currency: string = payload;
        return {currency};
      },

      [EActions.UPDATE_REQUEST]: ({state: {loadState}, payload, dispatch}) => {
        const {resolve, reject}: IPromisePayload = payload;
        if (loadState === 'loading') return;
        getCurrencies()
          .then(currencyRates => {
            dispatch<ICurrencyRates>(EActions.UPDATE_RESPONSE, currencyRates);
            resolve && resolve();
          })
          .catch(error => {
            console.error('currenciesSection: cannot send request to fetch currencies', error);
            dispatch<string>(EActions.UPDATE_FAIL, error.message || 'General error, cannot fetch currencies');
            reject && reject(error);
          });
        return {
          loadState: 'loading',
          error: '',
        };
      },

      [EActions.UPDATE_RESPONSE]: ({payload, dispatch}) => {
        const currenciesRate: ICurrencyRates = payload;
        const newCurrencies = new DynaCurrencies();
        newCurrencies.updateRates(currenciesRate);
        dispatch<void>(EActions.CURRENCIES_LOADED, undefined, {blockChange: true});
        return {
          loadState: 'loaded',
          currencies: newCurrencies,
          lastUpdate: new Date,
        };
      },

      [EActions.UPDATE_FAIL]: ({state: {currencies}, payload}) => {
        const errorMessage: string = payload;
        return {
          loadState: currencies.hasRates ? 'loaded' : 'empty',
          error: errorMessage,
        };
      },
    },
  });

  const updateIfNeeded = async (): Promise<void> => {
    await new Promise(r => setTimeout(r, 10));
    if (!updateIfOldenThanMinutes) return;
    const isOutDated = Date.now() - (section.state.lastUpdate || 0).valueOf() > updateIfOldenThanMinutes * 60 * 1000;
    if (isOutDated && section.state.loadState !== "loading") {
      section.dispatch<IPromisePayload>(EActions.UPDATE_REQUEST, {});
    }
  };

  return {
    set currency(newCurrency: string) {
      section.dispatch<string>(EActions.SET_CURRENCY, newCurrency);
    },
    get currency(): string {
      return section.state.currency;
    },
    get hasLoadedRates(): boolean {
      return section.state.currencies.hasRates;
    },
    loadRates: (): Promise<void> => {
      return new Promise((resolve, reject) => {
        section.dispatch<IPromisePayload>(EActions.UPDATE_REQUEST, {resolve, reject});
      });
    },
    convert: (value: number, sourceCurrency: string, round = false): number | null => {
      updateIfNeeded();
      const {currency, currencies} = section.state;
      return currencies.convert(value, sourceCurrency, currency, round);
    },
    convertDynaPrice: (price: IDynaPrice): IDynaPrice | null => {
      updateIfNeeded();
      const {currency, currencies} = section.state;
      return currencies.convertDynaPrice(price, currency);
    },
    convertToLabel: (value: number, sourceCurrency: string): IDynaLabelCurrency | null => {
      updateIfNeeded();
      const {currency, currencies} = section.state;
      return currencies.convertToLabel(value, sourceCurrency, currency);
    },
  };
};
