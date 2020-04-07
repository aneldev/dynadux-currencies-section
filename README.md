# About

[Dynadux](https://github.com/aneldev/dynadux) Section for Currencies.

# Usage

_In Typescript_

Let's create the function that creates the app store and uses this package.

```
import {createCurrenciesSection} from "dynadux-currencies-section";

interface IState {
  // ... other sections or state props
  currenciesSection: ICreateCurrenciesSectionState;
}

const createAppStore = (onChange: (state: IState) => void) => {
  const store = createStore<IState>({onChange});

  return {
   // ... other parts of the store
   currencies: createCurrenciesSection({
      sectionName: 'currenciesSection',
      store,
      defaultCurrency: 'eur',
      updateIfOldenThanMinutes: 30,
      getCurrencies, // A currencies rates getter
    })
  };
};

```
Lets use the store.
```
const appStore = createAppStore({onChange: ()=> ... });

// Wait to load the rates
await appStore.currencies.loadRates();

// Switch currency
appStore.currencies.currency = 'usd';

// Convert eur (to current currency usd)
const usdValue = appStore.currencies.convert(12.20, 'eur'); // 11.09

```

# createCurrenciesSection config

```
interface ICreateCurrenciesSectionConfig {
  store: ICreateStoreAPI;   // Dynadux store
  sectionName: string;
  defaultCurrency: string;
  getCurrencies: () => Promise<ICurrencyRates>;
  updateIfOldenThanMinutes?: number;
}

interface ICurrencyRates {
  [currencyName: string]: number | undefined;
}
```
# createCurrenciesSection State

The state is exposed to the `sectionName` of the config. But in practice, you don't have to access the State since the API has everything that you want.

Maybe, the most notable is the `currency` prop.

```
ICreateCurrenciesSectionState {
  loadState: 'empty' | 'loading' | 'loaded';
  currency: string;
  currencies: DynaCurrencies;
  error: string;
  lastUpdate: Date | null;
}
```

Also, the `currencies: DynaCurrencies` is the instance of the [DynaCurrencies](https://github.com/aneldev/dyna-currencies) converter, that offers a list of currencies, etc.. Checkout it's repo to see what it offers.

# createCurrenciesSection API

#### currency: string

Get and set the current currency.

#### hasLoadedRates: boolean

Boolean to know if the rates are loaded

#### loadRates: (): Promise<void>

Uses the `getCurrencies` of the config to get the rates.

#### convert: (value: number, sourceCurrency: string, round = false): number | null

Rate converter to current currency. 

Returns null if the rates are not loaded, or when the currency is wrong.

#### convertDynaPrice: (price: IDynaPrice): IDynaPrice | null

Convert an IDynaPrice to the current currency.

#### convertToLabel: (value: number, sourceCurrency: string): IDynaLabelCurrency | null

Convert and create an IDynaLabelCurrency
