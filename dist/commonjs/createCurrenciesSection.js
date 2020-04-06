"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DynaNodeClient_1 = require("dyna-node/dist/esNext/DynaNodeClient/DynaNodeClient");
var esNext_1 = require("dyna-currencies/dist/esNext");
var service_interfaces_1 = require("./service.interfaces");
var EActions;
(function (EActions) {
    EActions["SET_CURRENCY"] = "CURRENCIES__SET_CURRENCY";
    EActions["UPDATE_REQUEST"] = "CURRENCIES__UPDATE_REQUEST";
    EActions["UPDATE_RESPONSE"] = "CURRENCIES__UPDATE_RESPONSE";
    EActions["UPDATE_FAIL"] = "CURRENCIES__UPDATE_FAIL";
    EActions["CURRENCIES_LOADED"] = "CURRENCIES__CURRENCIES_LOADED";
})(EActions = exports.EActions || (exports.EActions = {}));
exports.createCurrenciesSection = function (_a) {
    var _b;
    var store = _a.store, sectionName = _a.sectionName, defaultCurrency = _a.defaultCurrency, getCurrenciesServiceDynaNodeAddress = _a.getCurrenciesServiceDynaNodeAddress, updateIfOldenThanMinutes = _a.updateIfOldenThanMinutes;
    var client = new DynaNodeClient_1.DynaNodeClient();
    var section = store.createSection({
        section: sectionName,
        initialState: {
            loadState: 'empty',
            currency: defaultCurrency,
            currencies: new esNext_1.DynaCurrencies(),
            error: '',
            lastUpdate: null,
        },
        reducers: (_b = {},
            _b[EActions.SET_CURRENCY] = function (_a) {
                var payload = _a.payload;
                var currency = payload;
                return { currency: currency };
            },
            _b[EActions.UPDATE_REQUEST] = function (_a) {
                var loadState = _a.state.loadState, dispatch = _a.dispatch;
                if (loadState === 'loading')
                    return;
                client.fetch({
                    to: getCurrenciesServiceDynaNodeAddress,
                    command: service_interfaces_1.COMMAND_GET_CURRENCY_RATES,
                })
                    .then(function (response) { return dispatch(EActions.UPDATE_RESPONSE, response.currencyRates); })
                    .catch(function (error) {
                    console.error('currenciesSection: cannot send request to fetch currencies', error);
                    dispatch(EActions.UPDATE_FAIL, error.message || 'General error, cannot fetch currencies');
                });
                return {
                    loadState: 'loading',
                    error: '',
                };
            },
            _b[EActions.UPDATE_RESPONSE] = function (_a) {
                var payload = _a.payload, dispatch = _a.dispatch;
                var currenciesRate = payload;
                var newCurrencies = new esNext_1.DynaCurrencies();
                newCurrencies.updateRates(currenciesRate);
                dispatch(EActions.CURRENCIES_LOADED, undefined, { triggerChange: false });
                return {
                    loadState: 'loaded',
                    currencies: newCurrencies,
                    lastUpdate: new Date,
                };
            },
            _b[EActions.UPDATE_FAIL] = function (_a) {
                var currencies = _a.state.currencies, payload = _a.payload;
                var errorMessage = payload;
                return {
                    loadState: currencies.hasRates ? 'loaded' : 'empty',
                    error: errorMessage,
                };
            },
            _b),
    });
    var updateIfNeeded = function () {
        if (!updateIfOldenThanMinutes)
            return;
        var isOutDated = Date.now() - (section.state.lastUpdate || 0).valueOf() > updateIfOldenThanMinutes * 60 * 1000;
        if (isOutDated && section.state.loadState !== "loading") {
            section.dispatch(EActions.UPDATE_REQUEST);
        }
    };
    return {
        get currency() {
            return section.state.currency;
        },
        updateCurrencies: function () { return section.dispatch(EActions.UPDATE_REQUEST); },
        convert: function (value, sourceCurrency, round) {
            if (round === void 0) { round = false; }
            updateIfNeeded();
            var _a = section.state, currency = _a.currency, currencies = _a.currencies;
            return currencies.convert(value, sourceCurrency, currency, round);
        },
        convertDynaPrice: function (price) {
            updateIfNeeded();
            var _a = section.state, currency = _a.currency, currencies = _a.currencies;
            return currencies.convertDynaPrice(price, currency);
        },
        convertToLabel: function (value, sourceCurrency) {
            updateIfNeeded();
            var _a = section.state, currency = _a.currency, currencies = _a.currencies;
            return currencies.convertToLabel(value, sourceCurrency, currency);
        },
    };
};
//# sourceMappingURL=createCurrenciesSection.js.map