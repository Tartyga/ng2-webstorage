(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global.ng2Webstorage = global.ng2Webstorage || {}),global.ng.core));
}(this, (function (exports,_angular_core) { 'use strict';

var STORAGE;
(function (STORAGE) {
    STORAGE[STORAGE["local"] = 0] = "local";
    STORAGE[STORAGE["session"] = 1] = "session";
})(STORAGE || (STORAGE = {}));

var LIB_KEY = 'ng2-webstorage';
var LIB_KEY_SEPARATOR = '|';
var LIB_KEY_CASE_SENSITIVE = false;
var STORAGE_NAMES = (_a = {},
    _a[STORAGE.local] = 'local',
    _a[STORAGE.session] = 'session',
    _a);
var _a;

var CUSTOM_LIB_KEY = LIB_KEY;
var CUSTOM_LIB_KEY_SEPARATOR = LIB_KEY_SEPARATOR;
var CUSTOM_LIB_KEY_CASE_SENSITIVE = LIB_KEY_CASE_SENSITIVE;
function isManagedKey(sKey) {
    return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
}
var KeyStorageHelper = (function () {
    function KeyStorageHelper() {
    }
    KeyStorageHelper.isManagedKey = function (sKey) {
        return sKey.indexOf(CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR) === 0;
    };
    KeyStorageHelper.retrieveKeysFromStorage = function (storage) {
        return Object.keys(storage).filter(isManagedKey);
    };
    KeyStorageHelper.genKey = function (raw) {
        if (typeof raw !== 'string')
            throw Error('attempt to generate a storage key with a non string value');
        return "" + CUSTOM_LIB_KEY + CUSTOM_LIB_KEY_SEPARATOR + this.formatKey(raw);
    };
    KeyStorageHelper.formatKey = function (raw) {
        var key = raw.toString();
        return CUSTOM_LIB_KEY_CASE_SENSITIVE ? key : key.toLowerCase();
    };
    KeyStorageHelper.setStorageKeyPrefix = function (key) {
        if (key === void 0) { key = LIB_KEY; }
        CUSTOM_LIB_KEY = key;
    };
    KeyStorageHelper.setCaseSensitivity = function (enable) {
        if (enable === void 0) { enable = LIB_KEY_CASE_SENSITIVE; }
        CUSTOM_LIB_KEY_CASE_SENSITIVE = enable;
    };
    KeyStorageHelper.setStorageKeySeparator = function (separator) {
        if (separator === void 0) { separator = LIB_KEY_SEPARATOR; }
        CUSTOM_LIB_KEY_SEPARATOR = separator;
    };
    return KeyStorageHelper;
}());

var StorageObserverHelper = (function () {
    function StorageObserverHelper() {
    }
    StorageObserverHelper.observe = function (sType, sKey) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            return this.observers[oKey];
        return this.observers[oKey] = new _angular_core.EventEmitter();
    };
    StorageObserverHelper.emit = function (sType, sKey, value) {
        var oKey = this.genObserverKey(sType, sKey);
        if (oKey in this.observers)
            this.observers[oKey].emit(value);
    };
    StorageObserverHelper.genObserverKey = function (sType, sKey) {
        return sType + '|' + sKey;
    };
    StorageObserverHelper.initStorage = function () {
        StorageObserverHelper.storageInitStream.emit(true);
    };
    StorageObserverHelper.observers = {};
    StorageObserverHelper.storageInitStream = new _angular_core.EventEmitter();
    StorageObserverHelper.storageInit$ = StorageObserverHelper.storageInitStream.asObservable();
    return StorageObserverHelper;
}());

var MockStorageHelper = (function () {
    function MockStorageHelper() {
    }
    MockStorageHelper.isSecuredField = function (field) {
        return !!~MockStorageHelper.securedFields.indexOf(field);
    };
    MockStorageHelper.getStorage = function (sType) {
        if (!this.mockStorages[sType])
            this.mockStorages[sType] = MockStorageHelper.generateStorage();
        return this.mockStorages[sType];
    };
    MockStorageHelper.generateStorage = function () {
        var storage = {};
        Object.defineProperties(storage, {
            setItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key, value) {
                    if (!MockStorageHelper.isSecuredField(key))
                        this[key] = value;
                },
            },
            getItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    return !MockStorageHelper.isSecuredField(key) ? this[key] || null : null;
                },
            },
            removeItem: {
                writable: false,
                enumerable: false,
                configurable: false,
                value: function (key) {
                    if (!MockStorageHelper.isSecuredField(key))
                        delete this[key];
                },
            },
            length: {
                enumerable: false,
                configurable: false,
                get: function () {
                    return Object.keys(this).length;
                }
            }
        });
        return storage;
    };
    MockStorageHelper.securedFields = ['setItem', 'getItem', 'removeItem', 'length'];
    MockStorageHelper.mockStorages = {};
    return MockStorageHelper;
}());

var CACHED = (_a$1 = {}, _a$1[STORAGE.local] = {}, _a$1[STORAGE.session] = {}, _a$1);
var STORAGE_AVAILABILITY = (_b = {}, _b[STORAGE.local] = null, _b[STORAGE.session] = null, _b);
var WebStorageHelper = (function () {
    function WebStorageHelper() {
    }
    WebStorageHelper.store = function (sType, sKey, value, json) {
        if (json === void 0) { json = true; }
        this.getStorage(sType).setItem(sKey, (json ? JSON.stringify(value) : value));
        CACHED[sType][sKey] = value;
        StorageObserverHelper.emit(sType, sKey, value);
    };
    WebStorageHelper.retrieve = function (sType, sKey) {
        if (sKey in CACHED[sType])
            return CACHED[sType][sKey];
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value !== null)
            CACHED[sType][sKey] = value;
        return value;
    };
    WebStorageHelper.retrieveFromStorage = function (sType, sKey) {
        var data = null;
        try {
            data = JSON.parse(this.getStorage(sType).getItem(sKey));
        }
        catch (err) {
            console.warn("invalid value for " + sKey);
        }
        return data;
    };
    WebStorageHelper.refresh = function (sType, sKey) {
        if (!KeyStorageHelper.isManagedKey(sKey))
            return;
        var value = WebStorageHelper.retrieveFromStorage(sType, sKey);
        if (value === null) {
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        }
        else if (value !== CACHED[sType][sKey]) {
            CACHED[sType][sKey] = value;
            StorageObserverHelper.emit(sType, sKey, value);
        }
    };
    WebStorageHelper.refreshAll = function (sType) {
        Object.keys(CACHED[sType]).forEach(function (sKey) { return WebStorageHelper.refresh(sType, sKey); });
    };
    WebStorageHelper.clearAll = function (sType) {
        var storage = this.getStorage(sType);
        KeyStorageHelper.retrieveKeysFromStorage(storage)
            .forEach(function (sKey) {
            storage.removeItem(sKey);
            delete CACHED[sType][sKey];
            StorageObserverHelper.emit(sType, sKey, null);
        });
    };
    WebStorageHelper.clear = function (sType, sKey) {
        this.getStorage(sType).removeItem(sKey);
        delete CACHED[sType][sKey];
        StorageObserverHelper.emit(sType, sKey, null);
    };
    WebStorageHelper.getStorage = function (sType) {
        if (this.isStorageAvailable(sType))
            return this.getWStorage(sType);
        else
            return MockStorageHelper.getStorage(sType);
    };
    WebStorageHelper.getWStorage = function (sType) {
        var storage;
        switch (sType) {
            case STORAGE.local:
                storage = localStorage;
                break;
            case STORAGE.session:
                storage = sessionStorage;
                break;
            default:
                throw Error('invalid storage type');
        }
        return storage;
    };
    WebStorageHelper.isStorageAvailable = function (sType) {
        if (typeof STORAGE_AVAILABILITY[sType] === 'boolean')
            return STORAGE_AVAILABILITY[sType];
        var isAvailable = true, storage;
        try {
            storage = this.getWStorage(sType);
            if (typeof storage === 'object') {
                storage.setItem('test-storage', 'foobar');
                storage.removeItem('test-storage');
            }
            else
                isAvailable = false;
        }
        catch (e) {
            isAvailable = false;
        }
        if (!isAvailable)
            console.warn(STORAGE_NAMES[sType] + " storage unavailable, Ng2Webstorage will use a fallback strategy instead");
        return STORAGE_AVAILABILITY[sType] = isAvailable;
    };
    return WebStorageHelper;
}());
var _a$1;
var _b;

var WebStorageService = (function () {
    function WebStorageService(sType) {
        if (sType === void 0) { sType = null; }
        this.sType = sType;
        this.sType = sType;
    }
    WebStorageService.prototype.store = function (raw, value, json) {
        var sKey = KeyStorageHelper.genKey(raw);
        WebStorageHelper.store(this.sType, sKey, value, json);
    };
    WebStorageService.prototype.retrieve = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return WebStorageHelper.retrieve(this.sType, sKey);
    };
    WebStorageService.prototype.clear = function (raw) {
        if (raw)
            WebStorageHelper.clear(this.sType, KeyStorageHelper.genKey(raw));
        else
            WebStorageHelper.clearAll(this.sType);
    };
    WebStorageService.prototype.observe = function (raw) {
        var sKey = KeyStorageHelper.genKey(raw);
        return StorageObserverHelper.observe(this.sType, sKey);
    };
    WebStorageService.prototype.isStorageAvailable = function () {
        return WebStorageHelper.isStorageAvailable(this.sType);
    };
    return WebStorageService;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LocalStorageService = (function (_super) {
    __extends(LocalStorageService, _super);
    function LocalStorageService() {
        return _super.call(this, STORAGE.local) || this;
    }
    LocalStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    LocalStorageService.ctorParameters = function () { return []; };
    return LocalStorageService;
}(WebStorageService));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var SessionStorageService = (function (_super) {
    __extends$1(SessionStorageService, _super);
    function SessionStorageService() {
        return _super.call(this, STORAGE.session) || this;
    }
    SessionStorageService.decorators = [
        { type: _angular_core.Injectable },
    ];
    /** @nocollapse */
    SessionStorageService.ctorParameters = function () { return []; };
    return SessionStorageService;
}(WebStorageService));

var WebstorageConfig = (function () {
    function WebstorageConfig(config) {
        this.prefix = LIB_KEY;
        this.separator = LIB_KEY_SEPARATOR;
        this.caseSensitive = LIB_KEY_CASE_SENSITIVE;
        if (config && config.prefix !== undefined) {
            this.prefix = config.prefix;
        }
        if (config && config.separator !== undefined) {
            this.separator = config.separator;
        }
        if (config && config.caseSensitive !== undefined) {
            this.caseSensitive = config.caseSensitive;
        }
    }
    return WebstorageConfig;
}());

function WebStorage(webSKey, sType, defaultValue) {
    if (defaultValue === void 0) { defaultValue = null; }
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue);
    };
}
function WebStorageDecorator(webSKey, sType, targetedClass, raw, defaultValue) {
    var key = webSKey || raw;
    Object.defineProperty(targetedClass, raw, {
        get: function () {
            var sKey = KeyStorageHelper.genKey(key);
            return WebStorageHelper.retrieve(sType, sKey);
        },
        set: function (value) {
            var sKey = KeyStorageHelper.genKey(key);
            this[sKey] = value;
            WebStorageHelper.store(sType, sKey, value);
        }
    });
    if (targetedClass[raw] === null && defaultValue !== undefined) {
        var sub_1 = StorageObserverHelper.storageInit$.subscribe(function () {
            targetedClass[raw] = defaultValue;
            sub_1.unsubscribe();
        });
    }
}

function LocalStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.local, targetedClass, raw, defaultValue);
    };
}

function SessionStorage(webSKey, defaultValue) {
    return function (targetedClass, raw) {
        WebStorageDecorator(webSKey, STORAGE.session, targetedClass, raw, defaultValue);
    };
}

var WEBSTORAGE_CONFIG = new _angular_core.InjectionToken('WEBSTORAGE_CONFIG');
var Ng2Webstorage = (function () {
    function Ng2Webstorage(ngZone, config) {
        this.ngZone = ngZone;
        if (config) {
            KeyStorageHelper.setStorageKeyPrefix(config.prefix);
            KeyStorageHelper.setStorageKeySeparator(config.separator);
            KeyStorageHelper.setCaseSensitivity(config.caseSensitive);
        }
        this.initStorageListener();
        StorageObserverHelper.initStorage();
    }
    Ng2Webstorage.forRoot = function (config) {
        return {
            ngModule: Ng2Webstorage,
            providers: [
                {
                    provide: WEBSTORAGE_CONFIG,
                    useValue: config
                },
                {
                    provide: WebstorageConfig,
                    useFactory: provideConfig,
                    deps: [
                        WEBSTORAGE_CONFIG
                    ]
                }
            ]
        };
    };
    Ng2Webstorage.prototype.initStorageListener = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', function (event) {
                return _this.ngZone.run(function () {
                    var storage = window.sessionStorage === event.storageArea ? STORAGE.session : STORAGE.local;
                    if (event.key === null)
                        WebStorageHelper.refreshAll(storage);
                    else
                        WebStorageHelper.refresh(storage, event.key);
                });
            });
        }
    };
    Ng2Webstorage.decorators = [
        { type: _angular_core.NgModule, args: [{
                    declarations: [],
                    providers: [SessionStorageService, LocalStorageService],
                    imports: []
                },] },
    ];
    /** @nocollapse */
    Ng2Webstorage.ctorParameters = function () { return [
        { type: _angular_core.NgZone, },
        { type: WebstorageConfig, decorators: [{ type: _angular_core.Optional }, { type: _angular_core.Inject, args: [WebstorageConfig,] },] },
    ]; };
    return Ng2Webstorage;
}());
function provideConfig(config) {
    return new WebstorageConfig(config);
}

exports.WEBSTORAGE_CONFIG = WEBSTORAGE_CONFIG;
exports.Ng2Webstorage = Ng2Webstorage;
exports.provideConfig = provideConfig;
exports.WebstorageConfig = WebstorageConfig;
exports.LocalStorage = LocalStorage;
exports.SessionStorage = SessionStorage;
exports.WebStorage = WebStorage;
exports.WebStorageDecorator = WebStorageDecorator;
exports.WebStorageService = WebStorageService;
exports.LocalStorageService = LocalStorageService;
exports.SessionStorageService = SessionStorageService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS51bWQuanMiLCJzb3VyY2VzIjpbIi4uL2Rpc3QvZW51bXMvc3RvcmFnZS5qcyIsIi4uL2Rpc3QvY29uc3RhbnRzL2xpYi5qcyIsIi4uL2Rpc3QvaGVscGVycy9rZXlTdG9yYWdlLmpzIiwiLi4vZGlzdC9oZWxwZXJzL3N0b3JhZ2VPYnNlcnZlci5qcyIsIi4uL2Rpc3QvaGVscGVycy9tb2NrU3RvcmFnZS5qcyIsIi4uL2Rpc3QvaGVscGVycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9zZXJ2aWNlcy9sb2NhbFN0b3JhZ2UuanMiLCIuLi9kaXN0L3NlcnZpY2VzL3Nlc3Npb25TdG9yYWdlLmpzIiwiLi4vZGlzdC9pbnRlcmZhY2VzL2NvbmZpZy5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy93ZWJTdG9yYWdlLmpzIiwiLi4vZGlzdC9kZWNvcmF0b3JzL2xvY2FsU3RvcmFnZS5qcyIsIi4uL2Rpc3QvZGVjb3JhdG9ycy9zZXNzaW9uU3RvcmFnZS5qcyIsIi4uL2Rpc3QvYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB2YXIgU1RPUkFHRTtcbihmdW5jdGlvbiAoU1RPUkFHRSkge1xuICAgIFNUT1JBR0VbU1RPUkFHRVtcImxvY2FsXCJdID0gMF0gPSBcImxvY2FsXCI7XG4gICAgU1RPUkFHRVtTVE9SQUdFW1wic2Vzc2lvblwiXSA9IDFdID0gXCJzZXNzaW9uXCI7XG59KShTVE9SQUdFIHx8IChTVE9SQUdFID0ge30pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgU1RPUkFHRSB9IGZyb20gJy4uL2VudW1zL3N0b3JhZ2UnO1xuZXhwb3J0IHZhciBMSUJfS0VZID0gJ25nMi13ZWJzdG9yYWdlJztcbmV4cG9ydCB2YXIgTElCX0tFWV9TRVBBUkFUT1IgPSAnfCc7XG5leHBvcnQgdmFyIExJQl9LRVlfQ0FTRV9TRU5TSVRJVkUgPSBmYWxzZTtcbmV4cG9ydCB2YXIgU1RPUkFHRV9OQU1FUyA9IChfYSA9IHt9LFxuICAgIF9hW1NUT1JBR0UubG9jYWxdID0gJ2xvY2FsJyxcbiAgICBfYVtTVE9SQUdFLnNlc3Npb25dID0gJ3Nlc3Npb24nLFxuICAgIF9hKTtcbnZhciBfYTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxpYi5qcy5tYXAiLCJpbXBvcnQgeyBMSUJfS0VZLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFLCBMSUJfS0VZX1NFUEFSQVRPUiB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xudmFyIENVU1RPTV9MSUJfS0VZID0gTElCX0tFWTtcbnZhciBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgPSBMSUJfS0VZX1NFUEFSQVRPUjtcbnZhciBDVVNUT01fTElCX0tFWV9DQVNFX1NFTlNJVElWRSA9IExJQl9LRVlfQ0FTRV9TRU5TSVRJVkU7XG5leHBvcnQgZnVuY3Rpb24gaXNNYW5hZ2VkS2V5KHNLZXkpIHtcbiAgICByZXR1cm4gc0tleS5pbmRleE9mKENVU1RPTV9MSUJfS0VZICsgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SKSA9PT0gMDtcbn1cbnZhciBLZXlTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBLZXlTdG9yYWdlSGVscGVyKCkge1xuICAgIH1cbiAgICBLZXlTdG9yYWdlSGVscGVyLmlzTWFuYWdlZEtleSA9IGZ1bmN0aW9uIChzS2V5KSB7XG4gICAgICAgIHJldHVybiBzS2V5LmluZGV4T2YoQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IpID09PSAwO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5yZXRyaWV2ZUtleXNGcm9tU3RvcmFnZSA9IGZ1bmN0aW9uIChzdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhzdG9yYWdlKS5maWx0ZXIoaXNNYW5hZ2VkS2V5KTtcbiAgICB9O1xuICAgIEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5ID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICBpZiAodHlwZW9mIHJhdyAhPT0gJ3N0cmluZycpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcignYXR0ZW1wdCB0byBnZW5lcmF0ZSBhIHN0b3JhZ2Uga2V5IHdpdGggYSBub24gc3RyaW5nIHZhbHVlJyk7XG4gICAgICAgIHJldHVybiBcIlwiICsgQ1VTVE9NX0xJQl9LRVkgKyBDVVNUT01fTElCX0tFWV9TRVBBUkFUT1IgKyB0aGlzLmZvcm1hdEtleShyYXcpO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5mb3JtYXRLZXkgPSBmdW5jdGlvbiAocmF3KSB7XG4gICAgICAgIHZhciBrZXkgPSByYXcudG9TdHJpbmcoKTtcbiAgICAgICAgcmV0dXJuIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID8ga2V5IDoga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgfTtcbiAgICBLZXlTdG9yYWdlSGVscGVyLnNldFN0b3JhZ2VLZXlQcmVmaXggPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09IHZvaWQgMCkgeyBrZXkgPSBMSUJfS0VZOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZID0ga2V5O1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkgPSBmdW5jdGlvbiAoZW5hYmxlKSB7XG4gICAgICAgIGlmIChlbmFibGUgPT09IHZvaWQgMCkgeyBlbmFibGUgPSBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFOyB9XG4gICAgICAgIENVU1RPTV9MSUJfS0VZX0NBU0VfU0VOU0lUSVZFID0gZW5hYmxlO1xuICAgIH07XG4gICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yID0gZnVuY3Rpb24gKHNlcGFyYXRvcikge1xuICAgICAgICBpZiAoc2VwYXJhdG9yID09PSB2b2lkIDApIHsgc2VwYXJhdG9yID0gTElCX0tFWV9TRVBBUkFUT1I7IH1cbiAgICAgICAgQ1VTVE9NX0xJQl9LRVlfU0VQQVJBVE9SID0gc2VwYXJhdG9yO1xuICAgIH07XG4gICAgcmV0dXJuIEtleVN0b3JhZ2VIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9a2V5U3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbnZhciBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0b3JhZ2VPYnNlcnZlckhlbHBlcigpIHtcbiAgICB9XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgdmFyIG9LZXkgPSB0aGlzLmdlbk9ic2VydmVyS2V5KHNUeXBlLCBzS2V5KTtcbiAgICAgICAgaWYgKG9LZXkgaW4gdGhpcy5vYnNlcnZlcnMpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vYnNlcnZlcnNbb0tleV07XG4gICAgICAgIHJldHVybiB0aGlzLm9ic2VydmVyc1tvS2V5XSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB9O1xuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSkge1xuICAgICAgICB2YXIgb0tleSA9IHRoaXMuZ2VuT2JzZXJ2ZXJLZXkoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAob0tleSBpbiB0aGlzLm9ic2VydmVycylcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzW29LZXldLmVtaXQodmFsdWUpO1xuICAgIH07XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmdlbk9ic2VydmVyS2V5ID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHJldHVybiBzVHlwZSArICd8JyArIHNLZXk7XG4gICAgfTtcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuaW5pdFN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbS5lbWl0KHRydWUpO1xuICAgIH07XG4gICAgU3RvcmFnZU9ic2VydmVySGVscGVyLm9ic2VydmVycyA9IHt9O1xuICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdFN0cmVhbSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuc3RvcmFnZUluaXQkID0gU3RvcmFnZU9ic2VydmVySGVscGVyLnN0b3JhZ2VJbml0U3RyZWFtLmFzT2JzZXJ2YWJsZSgpO1xuICAgIHJldHVybiBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXI7XG59KCkpO1xuZXhwb3J0IHsgU3RvcmFnZU9ic2VydmVySGVscGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zdG9yYWdlT2JzZXJ2ZXIuanMubWFwIiwidmFyIE1vY2tTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNb2NrU3RvcmFnZUhlbHBlcigpIHtcbiAgICB9XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgcmV0dXJuICEhfk1vY2tTdG9yYWdlSGVscGVyLnNlY3VyZWRGaWVsZHMuaW5kZXhPZihmaWVsZCk7XG4gICAgfTtcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5nZXRTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIGlmICghdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdKVxuICAgICAgICAgICAgdGhpcy5tb2NrU3RvcmFnZXNbc1R5cGVdID0gTW9ja1N0b3JhZ2VIZWxwZXIuZ2VuZXJhdGVTdG9yYWdlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLm1vY2tTdG9yYWdlc1tzVHlwZV07XG4gICAgfTtcbiAgICBNb2NrU3RvcmFnZUhlbHBlci5nZW5lcmF0ZVN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdG9yYWdlID0ge307XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0b3JhZ2UsIHtcbiAgICAgICAgICAgIHNldEl0ZW06IHtcbiAgICAgICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRJdGVtOiB7XG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFNb2NrU3RvcmFnZUhlbHBlci5pc1NlY3VyZWRGaWVsZChrZXkpID8gdGhpc1trZXldIHx8IG51bGwgOiBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlSXRlbToge1xuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghTW9ja1N0b3JhZ2VIZWxwZXIuaXNTZWN1cmVkRmllbGQoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcykubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzdG9yYWdlO1xuICAgIH07XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIuc2VjdXJlZEZpZWxkcyA9IFsnc2V0SXRlbScsICdnZXRJdGVtJywgJ3JlbW92ZUl0ZW0nLCAnbGVuZ3RoJ107XG4gICAgTW9ja1N0b3JhZ2VIZWxwZXIubW9ja1N0b3JhZ2VzID0ge307XG4gICAgcmV0dXJuIE1vY2tTdG9yYWdlSGVscGVyO1xufSgpKTtcbmV4cG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2NrU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XG5pbXBvcnQgeyBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfSBmcm9tICcuL3N0b3JhZ2VPYnNlcnZlcic7XG5pbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9rZXlTdG9yYWdlJztcbmltcG9ydCB7IE1vY2tTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9tb2NrU3RvcmFnZSc7XG5pbXBvcnQgeyBTVE9SQUdFX05BTUVTIH0gZnJvbSAnLi4vY29uc3RhbnRzL2xpYic7XG52YXIgQ0FDSEVEID0gKF9hID0ge30sIF9hW1NUT1JBR0UubG9jYWxdID0ge30sIF9hW1NUT1JBR0Uuc2Vzc2lvbl0gPSB7fSwgX2EpO1xudmFyIFNUT1JBR0VfQVZBSUxBQklMSVRZID0gKF9iID0ge30sIF9iW1NUT1JBR0UubG9jYWxdID0gbnVsbCwgX2JbU1RPUkFHRS5zZXNzaW9uXSA9IG51bGwsIF9iKTtcbnZhciBXZWJTdG9yYWdlSGVscGVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBXZWJTdG9yYWdlSGVscGVyKCkge1xuICAgIH1cbiAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5LCB2YWx1ZSwganNvbikge1xuICAgICAgICBpZiAoanNvbiA9PT0gdm9pZCAwKSB7IGpzb24gPSB0cnVlOyB9XG4gICAgICAgIHRoaXMuZ2V0U3RvcmFnZShzVHlwZSkuc2V0SXRlbShzS2V5LCAoanNvbiA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IHZhbHVlKSk7XG4gICAgICAgIENBQ0hFRFtzVHlwZV1bc0tleV0gPSB2YWx1ZTtcbiAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIHZhbHVlKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmUgPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgaWYgKHNLZXkgaW4gQ0FDSEVEW3NUeXBlXSlcbiAgICAgICAgICAgIHJldHVybiBDQUNIRURbc1R5cGVdW3NLZXldO1xuICAgICAgICB2YXIgdmFsdWUgPSBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlRnJvbVN0b3JhZ2Uoc1R5cGUsIHNLZXkpO1xuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpXG4gICAgICAgICAgICBDQUNIRURbc1R5cGVdW3NLZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIucmV0cmlldmVGcm9tU3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSwgc0tleSkge1xuICAgICAgICB2YXIgZGF0YSA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkYXRhID0gSlNPTi5wYXJzZSh0aGlzLmdldFN0b3JhZ2Uoc1R5cGUpLmdldEl0ZW0oc0tleSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcImludmFsaWQgdmFsdWUgZm9yIFwiICsgc0tleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2ggPSBmdW5jdGlvbiAoc1R5cGUsIHNLZXkpIHtcbiAgICAgICAgaWYgKCFLZXlTdG9yYWdlSGVscGVyLmlzTWFuYWdlZEtleShzS2V5KSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdmFyIHZhbHVlID0gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZUZyb21TdG9yYWdlKHNUeXBlLCBzS2V5KTtcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcbiAgICAgICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2YWx1ZSAhPT0gQ0FDSEVEW3NUeXBlXVtzS2V5XSkge1xuICAgICAgICAgICAgQ0FDSEVEW3NUeXBlXVtzS2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgU3RvcmFnZU9ic2VydmVySGVscGVyLmVtaXQoc1R5cGUsIHNLZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5yZWZyZXNoQWxsID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKENBQ0hFRFtzVHlwZV0pLmZvckVhY2goZnVuY3Rpb24gKHNLZXkpIHsgcmV0dXJuIFdlYlN0b3JhZ2VIZWxwZXIucmVmcmVzaChzVHlwZSwgc0tleSk7IH0pO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZUhlbHBlci5jbGVhckFsbCA9IGZ1bmN0aW9uIChzVHlwZSkge1xuICAgICAgICB2YXIgc3RvcmFnZSA9IHRoaXMuZ2V0U3RvcmFnZShzVHlwZSk7XG4gICAgICAgIEtleVN0b3JhZ2VIZWxwZXIucmV0cmlldmVLZXlzRnJvbVN0b3JhZ2Uoc3RvcmFnZSlcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5KSB7XG4gICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oc0tleSk7XG4gICAgICAgICAgICBkZWxldGUgQ0FDSEVEW3NUeXBlXVtzS2V5XTtcbiAgICAgICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBudWxsKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLmNsZWFyID0gZnVuY3Rpb24gKHNUeXBlLCBzS2V5KSB7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmFnZShzVHlwZSkucmVtb3ZlSXRlbShzS2V5KTtcbiAgICAgICAgZGVsZXRlIENBQ0hFRFtzVHlwZV1bc0tleV07XG4gICAgICAgIFN0b3JhZ2VPYnNlcnZlckhlbHBlci5lbWl0KHNUeXBlLCBzS2V5LCBudWxsKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xuICAgICAgICBpZiAodGhpcy5pc1N0b3JhZ2VBdmFpbGFibGUoc1R5cGUpKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0V1N0b3JhZ2Uoc1R5cGUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gTW9ja1N0b3JhZ2VIZWxwZXIuZ2V0U3RvcmFnZShzVHlwZSk7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLmdldFdTdG9yYWdlID0gZnVuY3Rpb24gKHNUeXBlKSB7XG4gICAgICAgIHZhciBzdG9yYWdlO1xuICAgICAgICBzd2l0Y2ggKHNUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNUT1JBR0UubG9jYWw6XG4gICAgICAgICAgICAgICAgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgU1RPUkFHRS5zZXNzaW9uOlxuICAgICAgICAgICAgICAgIHN0b3JhZ2UgPSBzZXNzaW9uU3RvcmFnZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2ludmFsaWQgc3RvcmFnZSB0eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0b3JhZ2U7XG4gICAgfTtcbiAgICBXZWJTdG9yYWdlSGVscGVyLmlzU3RvcmFnZUF2YWlsYWJsZSA9IGZ1bmN0aW9uIChzVHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIFNUT1JBR0VfQVZBSUxBQklMSVRZW3NUeXBlXSA9PT0gJ2Jvb2xlYW4nKVxuICAgICAgICAgICAgcmV0dXJuIFNUT1JBR0VfQVZBSUxBQklMSVRZW3NUeXBlXTtcbiAgICAgICAgdmFyIGlzQXZhaWxhYmxlID0gdHJ1ZSwgc3RvcmFnZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHN0b3JhZ2UgPSB0aGlzLmdldFdTdG9yYWdlKHNUeXBlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RvcmFnZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnNldEl0ZW0oJ3Rlc3Qtc3RvcmFnZScsICdmb29iYXInKTtcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rlc3Qtc3RvcmFnZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlzQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0F2YWlsYWJsZSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihTVE9SQUdFX05BTUVTW3NUeXBlXSArIFwiIHN0b3JhZ2UgdW5hdmFpbGFibGUsIE5nMldlYnN0b3JhZ2Ugd2lsbCB1c2UgYSBmYWxsYmFjayBzdHJhdGVneSBpbnN0ZWFkXCIpO1xuICAgICAgICByZXR1cm4gU1RPUkFHRV9BVkFJTEFCSUxJVFlbc1R5cGVdID0gaXNBdmFpbGFibGU7XG4gICAgfTtcbiAgICByZXR1cm4gV2ViU3RvcmFnZUhlbHBlcjtcbn0oKSk7XG5leHBvcnQgeyBXZWJTdG9yYWdlSGVscGVyIH07XG52YXIgX2EsIF9iO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBLZXlTdG9yYWdlSGVscGVyLCBXZWJTdG9yYWdlSGVscGVyLCBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2luZGV4JztcbnZhciBXZWJTdG9yYWdlU2VydmljZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gV2ViU3RvcmFnZVNlcnZpY2Uoc1R5cGUpIHtcbiAgICAgICAgaWYgKHNUeXBlID09PSB2b2lkIDApIHsgc1R5cGUgPSBudWxsOyB9XG4gICAgICAgIHRoaXMuc1R5cGUgPSBzVHlwZTtcbiAgICAgICAgdGhpcy5zVHlwZSA9IHNUeXBlO1xuICAgIH1cbiAgICBXZWJTdG9yYWdlU2VydmljZS5wcm90b3R5cGUuc3RvcmUgPSBmdW5jdGlvbiAocmF3LCB2YWx1ZSwganNvbikge1xuICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdyk7XG4gICAgICAgIFdlYlN0b3JhZ2VIZWxwZXIuc3RvcmUodGhpcy5zVHlwZSwgc0tleSwgdmFsdWUsIGpzb24pO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLnJldHJpZXZlID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdyk7XG4gICAgICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyLnJldHJpZXZlKHRoaXMuc1R5cGUsIHNLZXkpO1xuICAgIH07XG4gICAgV2ViU3RvcmFnZVNlcnZpY2UucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICBpZiAocmF3KVxuICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5jbGVhcih0aGlzLnNUeXBlLCBLZXlTdG9yYWdlSGVscGVyLmdlbktleShyYXcpKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5jbGVhckFsbCh0aGlzLnNUeXBlKTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24gKHJhdykge1xuICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KHJhdyk7XG4gICAgICAgIHJldHVybiBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIub2JzZXJ2ZSh0aGlzLnNUeXBlLCBzS2V5KTtcbiAgICB9O1xuICAgIFdlYlN0b3JhZ2VTZXJ2aWNlLnByb3RvdHlwZS5pc1N0b3JhZ2VBdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBXZWJTdG9yYWdlSGVscGVyLmlzU3RvcmFnZUF2YWlsYWJsZSh0aGlzLnNUeXBlKTtcbiAgICB9O1xuICAgIHJldHVybiBXZWJTdG9yYWdlU2VydmljZTtcbn0oKSk7XG5leHBvcnQgeyBXZWJTdG9yYWdlU2VydmljZSB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d2ViU3RvcmFnZS5qcy5tYXAiLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmltcG9ydCB7IFdlYlN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcbnZhciBMb2NhbFN0b3JhZ2VTZXJ2aWNlID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoTG9jYWxTdG9yYWdlU2VydmljZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBMb2NhbFN0b3JhZ2VTZXJ2aWNlKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgU1RPUkFHRS5sb2NhbCkgfHwgdGhpcztcbiAgICB9XG4gICAgTG9jYWxTdG9yYWdlU2VydmljZS5kZWNvcmF0b3JzID0gW1xuICAgICAgICB7IHR5cGU6IEluamVjdGFibGUgfSxcbiAgICBdO1xuICAgIC8qKiBAbm9jb2xsYXBzZSAqL1xuICAgIExvY2FsU3RvcmFnZVNlcnZpY2UuY3RvclBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXTsgfTtcbiAgICByZXR1cm4gTG9jYWxTdG9yYWdlU2VydmljZTtcbn0oV2ViU3RvcmFnZVNlcnZpY2UpKTtcbmV4cG9ydCB7IExvY2FsU3RvcmFnZVNlcnZpY2UgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWxvY2FsU3RvcmFnZS5qcy5tYXAiLCJ2YXIgX19leHRlbmRzID0gKHRoaXMgJiYgdGhpcy5fX2V4dGVuZHMpIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTsgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICAgICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XG4gICAgICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbiAgICB9O1xufSkoKTtcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuLi9lbnVtcy9zdG9yYWdlJztcbmltcG9ydCB7IFdlYlN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi93ZWJTdG9yYWdlJztcbnZhciBTZXNzaW9uU3RvcmFnZVNlcnZpY2UgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhTZXNzaW9uU3RvcmFnZVNlcnZpY2UsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlKCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgU1RPUkFHRS5zZXNzaW9uKSB8fCB0aGlzO1xuICAgIH1cbiAgICBTZXNzaW9uU3RvcmFnZVNlcnZpY2UuZGVjb3JhdG9ycyA9IFtcbiAgICAgICAgeyB0eXBlOiBJbmplY3RhYmxlIH0sXG4gICAgXTtcbiAgICAvKiogQG5vY29sbGFwc2UgKi9cbiAgICBTZXNzaW9uU3RvcmFnZVNlcnZpY2UuY3RvclBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbXTsgfTtcbiAgICByZXR1cm4gU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlO1xufShXZWJTdG9yYWdlU2VydmljZSkpO1xuZXhwb3J0IHsgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zZXNzaW9uU3RvcmFnZS5qcy5tYXAiLCJpbXBvcnQgeyBMSUJfS0VZLCBMSUJfS0VZX0NBU0VfU0VOU0lUSVZFLCBMSUJfS0VZX1NFUEFSQVRPUiB9IGZyb20gJy4uL2NvbnN0YW50cy9saWInO1xudmFyIFdlYnN0b3JhZ2VDb25maWcgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFdlYnN0b3JhZ2VDb25maWcoY29uZmlnKSB7XG4gICAgICAgIHRoaXMucHJlZml4ID0gTElCX0tFWTtcbiAgICAgICAgdGhpcy5zZXBhcmF0b3IgPSBMSUJfS0VZX1NFUEFSQVRPUjtcbiAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlID0gTElCX0tFWV9DQVNFX1NFTlNJVElWRTtcbiAgICAgICAgaWYgKGNvbmZpZyAmJiBjb25maWcucHJlZml4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucHJlZml4ID0gY29uZmlnLnByZWZpeDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5zZXBhcmF0b3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zZXBhcmF0b3IgPSBjb25maWcuc2VwYXJhdG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcgJiYgY29uZmlnLmNhc2VTZW5zaXRpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jYXNlU2Vuc2l0aXZlID0gY29uZmlnLmNhc2VTZW5zaXRpdmU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFdlYnN0b3JhZ2VDb25maWc7XG59KCkpO1xuZXhwb3J0IHsgV2Vic3RvcmFnZUNvbmZpZyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29uZmlnLmpzLm1hcCIsImltcG9ydCB7IEtleVN0b3JhZ2VIZWxwZXIsIFdlYlN0b3JhZ2VIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL2luZGV4JztcbmltcG9ydCB7IFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9IGZyb20gJy4uL2hlbHBlcnMvc3RvcmFnZU9ic2VydmVyJztcbmV4cG9ydCBmdW5jdGlvbiBXZWJTdG9yYWdlKHdlYlNLZXksIHNUeXBlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAoZGVmYXVsdFZhbHVlID09PSB2b2lkIDApIHsgZGVmYXVsdFZhbHVlID0gbnVsbDsgfVxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0ZWRDbGFzcywgcmF3KSB7XG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgc1R5cGUsIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgc1R5cGUsIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKSB7XG4gICAgdmFyIGtleSA9IHdlYlNLZXkgfHwgcmF3O1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXRlZENsYXNzLCByYXcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KGtleSk7XG4gICAgICAgICAgICByZXR1cm4gV2ViU3RvcmFnZUhlbHBlci5yZXRyaWV2ZShzVHlwZSwgc0tleSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc0tleSA9IEtleVN0b3JhZ2VIZWxwZXIuZ2VuS2V5KGtleSk7XG4gICAgICAgICAgICB0aGlzW3NLZXldID0gdmFsdWU7XG4gICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnN0b3JlKHNUeXBlLCBzS2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodGFyZ2V0ZWRDbGFzc1tyYXddID09PSBudWxsICYmIGRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBzdWJfMSA9IFN0b3JhZ2VPYnNlcnZlckhlbHBlci5zdG9yYWdlSW5pdCQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRhcmdldGVkQ2xhc3NbcmF3XSA9IGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgIHN1Yl8xLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXdlYlN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgV2ViU3RvcmFnZURlY29yYXRvciB9IGZyb20gJy4vd2ViU3RvcmFnZSc7XG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XG5leHBvcnQgZnVuY3Rpb24gTG9jYWxTdG9yYWdlKHdlYlNLZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0ZWRDbGFzcywgcmF3KSB7XG4gICAgICAgIFdlYlN0b3JhZ2VEZWNvcmF0b3Iod2ViU0tleSwgU1RPUkFHRS5sb2NhbCwgdGFyZ2V0ZWRDbGFzcywgcmF3LCBkZWZhdWx0VmFsdWUpO1xuICAgIH07XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1sb2NhbFN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgV2ViU3RvcmFnZURlY29yYXRvciB9IGZyb20gJy4vd2ViU3RvcmFnZSc7XG5pbXBvcnQgeyBTVE9SQUdFIH0gZnJvbSAnLi4vZW51bXMvc3RvcmFnZSc7XG5leHBvcnQgZnVuY3Rpb24gU2Vzc2lvblN0b3JhZ2Uod2ViU0tleSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXRlZENsYXNzLCByYXcpIHtcbiAgICAgICAgV2ViU3RvcmFnZURlY29yYXRvcih3ZWJTS2V5LCBTVE9SQUdFLnNlc3Npb24sIHRhcmdldGVkQ2xhc3MsIHJhdywgZGVmYXVsdFZhbHVlKTtcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2Vzc2lvblN0b3JhZ2UuanMubWFwIiwiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTmdNb2R1bGUsIE5nWm9uZSwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFNUT1JBR0UgfSBmcm9tICcuL2VudW1zL3N0b3JhZ2UnO1xuaW1wb3J0IHsgTG9jYWxTdG9yYWdlU2VydmljZSwgU2Vzc2lvblN0b3JhZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9pbmRleCc7XG5pbXBvcnQgeyBXZWJTdG9yYWdlSGVscGVyIH0gZnJvbSAnLi9oZWxwZXJzL3dlYlN0b3JhZ2UnO1xuaW1wb3J0IHsgV2Vic3RvcmFnZUNvbmZpZyB9IGZyb20gJy4vaW50ZXJmYWNlcy9jb25maWcnO1xuaW1wb3J0IHsgS2V5U3RvcmFnZUhlbHBlciB9IGZyb20gJy4vaGVscGVycy9rZXlTdG9yYWdlJztcbmltcG9ydCB7IFN0b3JhZ2VPYnNlcnZlckhlbHBlciB9IGZyb20gJy4vaGVscGVycy9zdG9yYWdlT2JzZXJ2ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzL2luZGV4JztcbmV4cG9ydCAqIGZyb20gJy4vZGVjb3JhdG9ycy9pbmRleCc7XG5leHBvcnQgKiBmcm9tICcuL3NlcnZpY2VzL2luZGV4JztcbmV4cG9ydCB2YXIgV0VCU1RPUkFHRV9DT05GSUcgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ1dFQlNUT1JBR0VfQ09ORklHJyk7XG52YXIgTmcyV2Vic3RvcmFnZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTmcyV2Vic3RvcmFnZShuZ1pvbmUsIGNvbmZpZykge1xuICAgICAgICB0aGlzLm5nWm9uZSA9IG5nWm9uZTtcbiAgICAgICAgaWYgKGNvbmZpZykge1xuICAgICAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5UHJlZml4KGNvbmZpZy5wcmVmaXgpO1xuICAgICAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5zZXRTdG9yYWdlS2V5U2VwYXJhdG9yKGNvbmZpZy5zZXBhcmF0b3IpO1xuICAgICAgICAgICAgS2V5U3RvcmFnZUhlbHBlci5zZXRDYXNlU2Vuc2l0aXZpdHkoY29uZmlnLmNhc2VTZW5zaXRpdmUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5pdFN0b3JhZ2VMaXN0ZW5lcigpO1xuICAgICAgICBTdG9yYWdlT2JzZXJ2ZXJIZWxwZXIuaW5pdFN0b3JhZ2UoKTtcbiAgICB9XG4gICAgTmcyV2Vic3RvcmFnZS5mb3JSb290ID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IE5nMldlYnN0b3JhZ2UsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdFQlNUT1JBR0VfQ09ORklHLFxuICAgICAgICAgICAgICAgICAgICB1c2VWYWx1ZTogY29uZmlnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGU6IFdlYnN0b3JhZ2VDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IHByb3ZpZGVDb25maWcsXG4gICAgICAgICAgICAgICAgICAgIGRlcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFdFQlNUT1JBR0VfQ09ORklHXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBOZzJXZWJzdG9yYWdlLnByb3RvdHlwZS5pbml0U3RvcmFnZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLm5nWm9uZS5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZSA9PT0gZXZlbnQuc3RvcmFnZUFyZWEgPyBTVE9SQUdFLnNlc3Npb24gOiBTVE9SQUdFLmxvY2FsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgV2ViU3RvcmFnZUhlbHBlci5yZWZyZXNoQWxsKHN0b3JhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWJTdG9yYWdlSGVscGVyLnJlZnJlc2goc3RvcmFnZSwgZXZlbnQua2V5KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBOZzJXZWJzdG9yYWdlLmRlY29yYXRvcnMgPSBbXG4gICAgICAgIHsgdHlwZTogTmdNb2R1bGUsIGFyZ3M6IFt7XG4gICAgICAgICAgICAgICAgICAgIGRlY2xhcmF0aW9uczogW10sXG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyczogW1Nlc3Npb25TdG9yYWdlU2VydmljZSwgTG9jYWxTdG9yYWdlU2VydmljZV0sXG4gICAgICAgICAgICAgICAgICAgIGltcG9ydHM6IFtdXG4gICAgICAgICAgICAgICAgfSxdIH0sXG4gICAgXTtcbiAgICAvKiogQG5vY29sbGFwc2UgKi9cbiAgICBOZzJXZWJzdG9yYWdlLmN0b3JQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW1xuICAgICAgICB7IHR5cGU6IE5nWm9uZSwgfSxcbiAgICAgICAgeyB0eXBlOiBXZWJzdG9yYWdlQ29uZmlnLCBkZWNvcmF0b3JzOiBbeyB0eXBlOiBPcHRpb25hbCB9LCB7IHR5cGU6IEluamVjdCwgYXJnczogW1dlYnN0b3JhZ2VDb25maWcsXSB9LF0gfSxcbiAgICBdOyB9O1xuICAgIHJldHVybiBOZzJXZWJzdG9yYWdlO1xufSgpKTtcbmV4cG9ydCB7IE5nMldlYnN0b3JhZ2UgfTtcbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQ29uZmlnKGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgV2Vic3RvcmFnZUNvbmZpZyhjb25maWcpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLmpzLm1hcCJdLCJuYW1lcyI6WyJFdmVudEVtaXR0ZXIiLCJfYSIsInRoaXMiLCJJbmplY3RhYmxlIiwiX19leHRlbmRzIiwiSW5qZWN0aW9uVG9rZW4iLCJOZ01vZHVsZSIsIk5nWm9uZSIsIk9wdGlvbmFsIiwiSW5qZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxJQUFJLE9BQU8sQ0FBQztBQUNuQixDQUFDLFVBQVUsT0FBTyxFQUFFO0lBQ2hCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0NBQy9DLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxBQUM5Qjs7QUNKTyxJQUFJLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQztBQUN0QyxBQUFPLElBQUksaUJBQWlCLEdBQUcsR0FBRyxDQUFDO0FBQ25DLEFBQU8sSUFBSSxzQkFBc0IsR0FBRyxLQUFLLENBQUM7QUFDMUMsQUFBTyxJQUFJLGFBQWEsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFO0lBQy9CLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTztJQUMzQixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVM7SUFDL0IsRUFBRSxDQUFDLENBQUM7QUFDUixJQUFJLEVBQUUsQ0FBQyxBQUNQOztBQ1JBLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQztBQUM3QixJQUFJLHdCQUF3QixHQUFHLGlCQUFpQixDQUFDO0FBQ2pELElBQUksNkJBQTZCLEdBQUcsc0JBQXNCLENBQUM7QUFDM0QsQUFBTyxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN4RTtBQUNELElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxZQUFZO0lBQ2hDLFNBQVMsZ0JBQWdCLEdBQUc7S0FDM0I7SUFDRCxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsVUFBVSxJQUFJLEVBQUU7UUFDNUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4RSxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxPQUFPLEVBQUU7UUFDMUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwRCxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLFVBQVUsR0FBRyxFQUFFO1FBQ3JDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUTtZQUN2QixNQUFNLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO1FBQzdFLE9BQU8sRUFBRSxHQUFHLGNBQWMsR0FBRyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9FLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsVUFBVSxHQUFHLEVBQUU7UUFDeEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sNkJBQTZCLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNsRSxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxHQUFHLEVBQUU7UUFDbEQsSUFBSSxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUU7UUFDdEMsY0FBYyxHQUFHLEdBQUcsQ0FBQztLQUN4QixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxNQUFNLEVBQUU7UUFDcEQsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRSxNQUFNLEdBQUcsc0JBQXNCLENBQUMsRUFBRTtRQUMzRCw2QkFBNkIsR0FBRyxNQUFNLENBQUM7S0FDMUMsQ0FBQztJQUNGLGdCQUFnQixDQUFDLHNCQUFzQixHQUFHLFVBQVUsU0FBUyxFQUFFO1FBQzNELElBQUksU0FBUyxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsU0FBUyxHQUFHLGlCQUFpQixDQUFDLEVBQUU7UUFDNUQsd0JBQXdCLEdBQUcsU0FBUyxDQUFDO0tBQ3hDLENBQUM7SUFDRixPQUFPLGdCQUFnQixDQUFDO0NBQzNCLEVBQUUsQ0FBQyxDQUFDLEFBQ0wsQUFBNEIsQUFDNUI7O0FDdkNBLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxZQUFZO0lBQ3JDLFNBQVMscUJBQXFCLEdBQUc7S0FDaEM7SUFDRCxxQkFBcUIsQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ25ELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSUEsMEJBQVksRUFBRSxDQUFDO0tBQ3BELENBQUM7SUFDRixxQkFBcUIsQ0FBQyxJQUFJLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtRQUN2RCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN4QyxDQUFDO0lBQ0YscUJBQXFCLENBQUMsY0FBYyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUMxRCxPQUFPLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQzdCLENBQUM7SUFDRixxQkFBcUIsQ0FBQyxXQUFXLEdBQUcsWUFBWTtRQUM1QyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdEQsQ0FBQztJQUNGLHFCQUFxQixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDckMscUJBQXFCLENBQUMsaUJBQWlCLEdBQUcsSUFBSUEsMEJBQVksRUFBRSxDQUFDO0lBQzdELHFCQUFxQixDQUFDLFlBQVksR0FBRyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM1RixPQUFPLHFCQUFxQixDQUFDO0NBQ2hDLEVBQUUsQ0FBQyxDQUFDLEFBQ0wsQUFBaUMsQUFDakM7O0FDM0JBLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxZQUFZO0lBQ2pDLFNBQVMsaUJBQWlCLEdBQUc7S0FDNUI7SUFDRCxpQkFBaUIsQ0FBQyxjQUFjLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDaEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzVELENBQUM7SUFDRixpQkFBaUIsQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ25DLENBQUM7SUFDRixpQkFBaUIsQ0FBQyxlQUFlLEdBQUcsWUFBWTtRQUM1QyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtZQUM3QixPQUFPLEVBQUU7Z0JBQ0wsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFlBQVksRUFBRSxLQUFLO2dCQUNuQixLQUFLLEVBQUUsVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFO29CQUN6QixJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQzt3QkFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztpQkFDekI7YUFDSjtZQUNELE9BQU8sRUFBRTtnQkFDTCxRQUFRLEVBQUUsS0FBSztnQkFDZixVQUFVLEVBQUUsS0FBSztnQkFDakIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRTtvQkFDbEIsT0FBTyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztpQkFDNUU7YUFDSjtZQUNELFVBQVUsRUFBRTtnQkFDUixRQUFRLEVBQUUsS0FBSztnQkFDZixVQUFVLEVBQUUsS0FBSztnQkFDakIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRTtvQkFDbEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7d0JBQ3RDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN4QjthQUNKO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixZQUFZLEVBQUUsS0FBSztnQkFDbkIsR0FBRyxFQUFFLFlBQVk7b0JBQ2IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQztpQkFDbkM7YUFDSjtTQUNKLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDO0tBQ2xCLENBQUM7SUFDRixpQkFBaUIsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRixpQkFBaUIsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLE9BQU8saUJBQWlCLENBQUM7Q0FDNUIsRUFBRSxDQUFDLENBQUMsQUFDTCxBQUE2QixBQUM3Qjs7QUNsREEsSUFBSSxNQUFNLEdBQUcsQ0FBQ0MsSUFBRSxHQUFHLEVBQUUsRUFBRUEsSUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUVBLElBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFQSxJQUFFLENBQUMsQ0FBQztBQUM3RSxJQUFJLG9CQUFvQixHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMvRixJQUFJLGdCQUFnQixHQUFHLENBQUMsWUFBWTtJQUNoQyxTQUFTLGdCQUFnQixHQUFHO0tBQzNCO0lBQ0QsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQ3pELElBQUksSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO1FBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0UsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUM1QixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNsRCxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUMvQyxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3JCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RCxJQUFJLEtBQUssS0FBSyxJQUFJO1lBQ2QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNoQyxPQUFPLEtBQUssQ0FBQztLQUNoQixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsVUFBVSxLQUFLLEVBQUUsSUFBSSxFQUFFO1FBQzFELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJO1lBQ0EsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMzRDtRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUM3QztRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2YsQ0FBQztJQUNGLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxVQUFVLEtBQUssRUFBRSxJQUFJLEVBQUU7UUFDOUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDcEMsT0FBTztRQUNYLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5RCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDaEIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDakQ7YUFDSSxJQUFJLEtBQUssS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM1QixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsRDtLQUNKLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDekcsQ0FBQztJQUNGLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxVQUFVLEtBQUssRUFBRTtRQUN6QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQzthQUM1QyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7WUFDekIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNqRCxDQUFDLENBQUM7S0FDTixDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLFVBQVUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNqRCxDQUFDO0lBQ0YsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLFVBQVUsS0FBSyxFQUFFO1FBQzNDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztZQUM5QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O1lBRS9CLE9BQU8saUJBQWlCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xELENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsVUFBVSxLQUFLLEVBQUU7UUFDNUMsSUFBSSxPQUFPLENBQUM7UUFDWixRQUFRLEtBQUs7WUFDVCxLQUFLLE9BQU8sQ0FBQyxLQUFLO2dCQUNkLE9BQU8sR0FBRyxZQUFZLENBQUM7Z0JBQ3ZCLE1BQU07WUFDVixLQUFLLE9BQU8sQ0FBQyxPQUFPO2dCQUNoQixPQUFPLEdBQUcsY0FBYyxDQUFDO2dCQUN6QixNQUFNO1lBQ1Y7Z0JBQ0ksTUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUMzQztRQUNELE9BQU8sT0FBTyxDQUFDO0tBQ2xCLENBQUM7SUFDRixnQkFBZ0IsQ0FBQyxrQkFBa0IsR0FBRyxVQUFVLEtBQUssRUFBRTtRQUNuRCxJQUFJLE9BQU8sb0JBQW9CLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUztZQUNoRCxPQUFPLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLElBQUksV0FBVyxHQUFHLElBQUksRUFBRSxPQUFPLENBQUM7UUFDaEMsSUFBSTtZQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xDLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUN0Qzs7Z0JBRUcsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUMzQjtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ04sV0FBVyxHQUFHLEtBQUssQ0FBQztTQUN2QjtRQUNELElBQUksQ0FBQyxXQUFXO1lBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsMEVBQTBFLENBQUMsQ0FBQztRQUNwSCxPQUFPLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxHQUFHLFdBQVcsQ0FBQztLQUNwRCxDQUFDO0lBQ0YsT0FBTyxnQkFBZ0IsQ0FBQztDQUMzQixFQUFFLENBQUMsQ0FBQztBQUNMLEFBQ0EsSUFBSUEsSUFBRTtJQUFFLEVBQUUsQ0FBQyxBQUNYOztBQzNHQSxJQUFJLGlCQUFpQixHQUFHLENBQUMsWUFBWTtJQUNqQyxTQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRTtRQUM5QixJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRTtRQUN2QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUN0QjtJQUNELGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtRQUM1RCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6RCxDQUFDO0lBQ0YsaUJBQWlCLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxVQUFVLEdBQUcsRUFBRTtRQUNsRCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN0RCxDQUFDO0lBQ0YsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsRUFBRTtRQUMvQyxJQUFJLEdBQUc7WUFDSCxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7WUFFakUsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM3QyxDQUFDO0lBQ0YsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsRUFBRTtRQUNqRCxJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsT0FBTyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztLQUMxRCxDQUFDO0lBQ0YsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFlBQVk7UUFDekQsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDMUQsQ0FBQztJQUNGLE9BQU8saUJBQWlCLENBQUM7Q0FDNUIsRUFBRSxDQUFDLENBQUMsQUFDTCxBQUE2QixBQUM3Qjs7QUMvQkEsSUFBSSxTQUFTLEdBQUcsQ0FBQ0MsU0FBSSxJQUFJQSxTQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZO0lBQ3JELElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjO1FBQ3JDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFlBQVksS0FBSyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0UsT0FBTyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbkIsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQixTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDdkMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3hGLENBQUM7Q0FDTCxDQUFDLEVBQUUsQ0FBQztBQUNMLEFBQ0EsQUFDQSxBQUNBLElBQUksbUJBQW1CLEdBQUcsQ0FBQyxVQUFVLE1BQU0sRUFBRTtJQUN6QyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdkMsU0FBUyxtQkFBbUIsR0FBRztRQUMzQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUM7S0FDbkQ7SUFDRCxtQkFBbUIsQ0FBQyxVQUFVLEdBQUc7UUFDN0IsRUFBRSxJQUFJLEVBQUVDLHdCQUFVLEVBQUU7S0FDdkIsQ0FBQzs7SUFFRixtQkFBbUIsQ0FBQyxjQUFjLEdBQUcsWUFBWSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNoRSxPQUFPLG1CQUFtQixDQUFDO0NBQzlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEFBQ3RCLEFBQStCLEFBQy9COztBQzFCQSxJQUFJQyxXQUFTLEdBQUcsQ0FBQ0YsU0FBSSxJQUFJQSxTQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZO0lBQ3JELElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjO1FBQ3JDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFlBQVksS0FBSyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0UsT0FBTyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbkIsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwQixTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDdkMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3hGLENBQUM7Q0FDTCxDQUFDLEVBQUUsQ0FBQztBQUNMLEFBQ0EsQUFDQSxBQUNBLElBQUkscUJBQXFCLEdBQUcsQ0FBQyxVQUFVLE1BQU0sRUFBRTtJQUMzQ0UsV0FBUyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLFNBQVMscUJBQXFCLEdBQUc7UUFDN0IsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ3JEO0lBQ0QscUJBQXFCLENBQUMsVUFBVSxHQUFHO1FBQy9CLEVBQUUsSUFBSSxFQUFFRCx3QkFBVSxFQUFFO0tBQ3ZCLENBQUM7O0lBRUYscUJBQXFCLENBQUMsY0FBYyxHQUFHLFlBQVksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbEUsT0FBTyxxQkFBcUIsQ0FBQztDQUNoQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxBQUN0QixBQUFpQyxBQUNqQzs7QUN6QkEsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLFlBQVk7SUFDaEMsU0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7UUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLHNCQUFzQixDQUFDO1FBQzVDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUMvQjtRQUNELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO1lBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztTQUNyQztRQUNELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO1lBQzlDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztTQUM3QztLQUNKO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztDQUMzQixFQUFFLENBQUMsQ0FBQyxBQUNMLEFBQTRCLEFBQzVCOztBQ2pCTyxTQUFTLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRTtJQUNyRCxJQUFJLFlBQVksS0FBSyxLQUFLLENBQUMsRUFBRSxFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRTtJQUNyRCxPQUFPLFVBQVUsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUNqQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDekUsQ0FBQztDQUNMO0FBQ0QsQUFBTyxTQUFTLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUU7SUFDbEYsSUFBSSxHQUFHLEdBQUcsT0FBTyxJQUFJLEdBQUcsQ0FBQztJQUN6QixNQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDdEMsR0FBRyxFQUFFLFlBQVk7WUFDYixJQUFJLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEMsT0FBTyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2pEO1FBQ0QsR0FBRyxFQUFFLFVBQVUsS0FBSyxFQUFFO1lBQ2xCLElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ25CLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzlDO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7UUFDM0QsSUFBSSxLQUFLLEdBQUcscUJBQXFCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxZQUFZO1lBQ2pFLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUM7WUFDbEMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3ZCLENBQUMsQ0FBQztLQUNOO0NBQ0osQUFDRDs7QUMxQk8sU0FBUyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtJQUNoRCxPQUFPLFVBQVUsYUFBYSxFQUFFLEdBQUcsRUFBRTtRQUNqQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2pGLENBQUM7Q0FDTCxBQUNEOztBQ0xPLFNBQVMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUU7SUFDbEQsT0FBTyxVQUFVLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFDakMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNuRixDQUFDO0NBQ0wsQUFDRDs7QUNHTyxJQUFJLGlCQUFpQixHQUFHLElBQUlFLDRCQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUN2RSxJQUFJLGFBQWEsR0FBRyxDQUFDLFlBQVk7SUFDN0IsU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRTtRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLE1BQU0sRUFBRTtZQUNSLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUQsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzdEO1FBQ0QsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IscUJBQXFCLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDdkM7SUFDRCxhQUFhLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSxFQUFFO1FBQ3RDLE9BQU87WUFDSCxRQUFRLEVBQUUsYUFBYTtZQUN2QixTQUFTLEVBQUU7Z0JBQ1A7b0JBQ0ksT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsUUFBUSxFQUFFLE1BQU07aUJBQ25CO2dCQUNEO29CQUNJLE9BQU8sRUFBRSxnQkFBZ0I7b0JBQ3pCLFVBQVUsRUFBRSxhQUFhO29CQUN6QixJQUFJLEVBQUU7d0JBQ0YsaUJBQWlCO3FCQUNwQjtpQkFDSjthQUNKO1NBQ0osQ0FBQztLQUNMLENBQUM7SUFDRixhQUFhLENBQUMsU0FBUyxDQUFDLG1CQUFtQixHQUFHLFlBQVk7UUFDdEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxLQUFLLEVBQUU7Z0JBQ2hELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWTtvQkFDaEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLGNBQWMsS0FBSyxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFDNUYsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLElBQUk7d0JBQ2xCLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7d0JBRXJDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwRCxDQUFDLENBQUM7YUFDTixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7SUFDRixhQUFhLENBQUMsVUFBVSxHQUFHO1FBQ3ZCLEVBQUUsSUFBSSxFQUFFQyxzQkFBUSxFQUFFLElBQUksRUFBRSxDQUFDO29CQUNiLFlBQVksRUFBRSxFQUFFO29CQUNoQixTQUFTLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQztvQkFDdkQsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsRUFBRSxFQUFFO0tBQ2hCLENBQUM7O0lBRUYsYUFBYSxDQUFDLGNBQWMsR0FBRyxZQUFZLEVBQUUsT0FBTztRQUNoRCxFQUFFLElBQUksRUFBRUMsb0JBQU0sR0FBRztRQUNqQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRUMsc0JBQVEsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFQyxvQkFBTSxFQUFFLElBQUksRUFBRSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxFQUFFO0tBQzdHLENBQUMsRUFBRSxDQUFDO0lBQ0wsT0FBTyxhQUFhLENBQUM7Q0FDeEIsRUFBRSxDQUFDLENBQUM7QUFDTCxBQUNBLEFBQU8sU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFO0lBQ2xDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN2QyxBQUNELDs7Ozs7Ozs7Ozs7Oyw7Oyw7OyJ9
