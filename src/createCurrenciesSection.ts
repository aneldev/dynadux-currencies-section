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
  SET_CURRENCY = 'CURRENCIES__SET_CURRENCY',                  // string, the currency, 3 chars
  UPDATE_REQUEST = 'CURRENCIES__UPDATE_REQUEST',              // IPromisePayload<ICurrencyRates>
  UPDATE_RESPONSE = 'CURRENCIES__UPDATE_RESPONSE',            // ICurrencyRates
  UPDATE_RESPONSE_SAVE = 'CURRENCIES__UPDATE_RESPONSE_SAVE',  // ICurrencyRates
  UPDATE_FAIL = 'CURRENCIES__UPDATE_FAIL',                    // string, the error message
  CURRENCIES_LOADED = 'CURRENCIES__CURRENCIES_LOADED',        // void
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
        const {resolve, reject}: IPromisePayload<ICurrencyRates> = payload;
        if (loadState === 'loading') return;
        getCurrencies()
          .then(currencyRates => {
            dispatch<ICurrencyRates>(EActions.UPDATE_RESPONSE, currencyRates);
            resolve && resolve(currencyRates);
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
        dispatch<ICurrencyRates>(EActions.UPDATE_RESPONSE_SAVE, payload, {blockChange: true});
        dispatch<void>(EActions.CURRENCIES_LOADED);
      },

      [EActions.UPDATE_RESPONSE_SAVE]: ({state, payload}) => {
        const currenciesRate: ICurrencyRates = payload;
        state.currencies.clearRates();    // For GC
        state.currencies = null as any;   // For GC
        const newCurrencies = new DynaCurrencies();
        newCurrencies.updateRates(currenciesRate);
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

  const output = {
    set currency(newCurrency: string) {
      section.dispatch<string>(EActions.SET_CURRENCY, newCurrency);
    },
    get currency(): string {
      return section.state.currency;
    },

    getCurrencyRates: async (): Promise<ICurrencyRates> => {
      const {loadState, currencies: {getCurrencyRatesDic}} = section.state;
      if (loadState === "loaded") {
        updateIfNeeded();
        return getCurrencyRatesDic();
      }
      return output.loadRates();
    },
    get hasLoadedRates(): boolean {
      return section.state.currencies.hasRates;
    },

    loadRates: (): Promise<ICurrencyRates> => {
      return new Promise((resolve, reject) => {
        section.dispatch<IPromisePayload<ICurrencyRates>>(EActions.UPDATE_REQUEST, {resolve, reject});
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

  return output;
};
