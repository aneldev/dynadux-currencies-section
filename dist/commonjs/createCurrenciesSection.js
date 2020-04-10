"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var commonJs_1 = require("dyna-currencies/dist/commonJs");
var EActions;
(function (EActions) {
    EActions["SET_CURRENCY"] = "CURRENCIES__SET_CURRENCY";
    EActions["UPDATE_REQUEST"] = "CURRENCIES__UPDATE_REQUEST";
    EActions["UPDATE_RESPONSE"] = "CURRENCIES__UPDATE_RESPONSE";
    EActions["UPDATE_RESPONSE_SAVE"] = "CURRENCIES__UPDATE_RESPONSE_SAVE";
    EActions["UPDATE_FAIL"] = "CURRENCIES__UPDATE_FAIL";
    EActions["CURRENCIES_LOADED"] = "CURRENCIES__CURRENCIES_LOADED";
})(EActions = exports.EActions || (exports.EActions = {}));
exports.createCurrenciesSection = function (_a) {
    var _b;
    var store = _a.store, sectionName = _a.sectionName, defaultCurrency = _a.defaultCurrency, getCurrencies = _a.getCurrencies, updateIfOldenThanMinutes = _a.updateIfOldenThanMinutes;
    var section = store.createSection({
        section: sectionName,
        initialState: {
            loadState: 'empty',
            currency: defaultCurrency,
            currencies: new commonJs_1.DynaCurrencies(),
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
                var loadState = _a.state.loadState, payload = _a.payload, dispatch = _a.dispatch;
                var resolve = payload.resolve, reject = payload.reject;
                if (loadState === 'loading')
                    return;
                getCurrencies()
                    .then(function (currencyRates) {
                    dispatch(EActions.UPDATE_RESPONSE, currencyRates);
                    resolve && resolve(currencyRates);
                })
                    .catch(function (error) {
                    console.error('currenciesSection: cannot send request to fetch currencies', error);
                    dispatch(EActions.UPDATE_FAIL, error.message || 'General error, cannot fetch currencies');
                    reject && reject(error);
                });
                return {
                    loadState: 'loading',
                    error: '',
                };
            },
            _b[EActions.UPDATE_RESPONSE] = function (_a) {
                var payload = _a.payload, dispatch = _a.dispatch;
                dispatch(EActions.UPDATE_RESPONSE_SAVE, payload, { blockChange: true });
                dispatch(EActions.CURRENCIES_LOADED);
            },
            _b[EActions.UPDATE_RESPONSE_SAVE] = function (_a) {
                var state = _a.state, payload = _a.payload;
                var currenciesRate = payload;
                state.currencies.clearRates(); // For GC
                state.currencies = null; // For GC
                var newCurrencies = new commonJs_1.DynaCurrencies();
                newCurrencies.updateRates(currenciesRate);
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
    var updateIfNeeded = function () { return __awaiter(void 0, void 0, void 0, function () {
        var isOutDated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                case 1:
                    _a.sent();
                    if (!updateIfOldenThanMinutes)
                        return [2 /*return*/];
                    isOutDated = Date.now() - (section.state.lastUpdate || 0).valueOf() > updateIfOldenThanMinutes * 60 * 1000;
                    if (isOutDated && section.state.loadState !== "loading") {
                        section.dispatch(EActions.UPDATE_REQUEST, {});
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var output = {
        set currency(newCurrency) {
            section.dispatch(EActions.SET_CURRENCY, newCurrency);
        },
        get currency() {
            return section.state.currency;
        },
        getCurrencyRates: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, loadState, getCurrencyRatesDic;
            return __generator(this, function (_b) {
                _a = section.state, loadState = _a.loadState, getCurrencyRatesDic = _a.currencies.getCurrencyRatesDic;
                if (loadState === "loaded") {
                    updateIfNeeded();
                    return [2 /*return*/, getCurrencyRatesDic()];
                }
                return [2 /*return*/, output.loadRates()];
            });
        }); },
        get hasLoadedRates() {
            return section.state.currencies.hasRates;
        },
        loadRates: function () {
            return new Promise(function (resolve, reject) {
                section.dispatch(EActions.UPDATE_REQUEST, { resolve: resolve, reject: reject });
            });
        },
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
    return output;
};
//# sourceMappingURL=createCurrenciesSection.js.map