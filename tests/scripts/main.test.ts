import "jest";
jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;

import { createStore } from "dynadux";
import { ICurrencyRates } from "dyna-currencies/dist/commonJs";

import {
  ICreateCurrenciesSectionState,
  createCurrenciesSection,
} from "../../src";

interface IState {
  currenciesSection: ICreateCurrenciesSectionState;
}

const getCurrencies = async (): Promise<ICurrencyRates> => {
  await new Promise(r => setTimeout(r, 200));
  return {
    eur: 1,
    usd: 1.10,
    jpy: 120,
  };
};

const createAppStore = () => {
  const store = createStore<IState>();

  return {
    currencies: createCurrenciesSection({
      sectionName: 'currenciesSection',
      store,
      defaultCurrency: 'eur',
      updateIfOldenThanMinutes: 30,
      getCurrencies,
    })
  };
};

describe('Dynadux Currencies section', () => {

  test('Section should fetch currencies and convert', async (done) => {
    const appStore = createAppStore();
    expect(appStore.currencies.hasLoadedRates).toBe(false);
    expect(appStore.currencies.convert(12.20, 'usd')).toBe(null);

    await appStore.currencies.loadRates();
    expect(appStore.currencies.hasLoadedRates).toBe(true);
    expect(appStore.currencies.convert(12.20, 'usd')).toBe(13.42);

    done();
  });

  test('Section should convert properly', async (done) => {
    const appStore = createAppStore();
    await appStore.currencies.loadRates();

    expect(appStore.currencies.convert(12.20, 'usd')).toBe(13.42);
    expect(appStore.currencies.convert(12.20, 'eur')).toBe(12.20);

    appStore.currencies.currency = 'usd';
    expect(appStore.currencies.currency).toBe('usd');

    expect(appStore.currencies.convert(12.20, 'usd')).toBe(12.20);
    expect(appStore.currencies.convert(12.20, 'eur', true)).toBe(11.09);
    done();
  });

});
