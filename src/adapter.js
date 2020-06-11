"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
exports.RedisAdapter = void 0;
var casbin_1 = require("casbin");
var redis = require("redis");
var Line = /** @class */ (function () {
    function Line() {
    }
    return Line;
}());
var RedisAdapter = /** @class */ (function () {
    function RedisAdapter(options) {
        this.redisInstance = null;
        this.policies = null;
        this.filtered = false;
        this.deliveredOptions = {
            retry_strategy: function (options) {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    return new Error('The server refused the connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error('Retry time exhausted');
                }
                if (options.attempt > 10) {
                    return undefined;
                }
                // reconnect after
                return Math.min(options.attempt * 100, 300);
            }
        };
        this.redisInstance = redis.createClient(__assign(__assign({}, options), this.deliveredOptions));
    }
    RedisAdapter.prototype.isFiltered = function () {
        return this.filtered;
    };
    /**
     * Helper Methods
     */
    RedisAdapter.prototype.savePolicyLine = function (ptype, rule) {
        var line = new Line();
        line.ptype = ptype;
        if (rule.length > 0) {
            line.v0 = rule[0];
        }
        if (rule.length > 1) {
            line.v1 = rule[1];
        }
        if (rule.length > 2) {
            line.v2 = rule[2];
        }
        if (rule.length > 3) {
            line.v3 = rule[3];
        }
        if (rule.length > 4) {
            line.v4 = rule[4];
        }
        if (rule.length > 5) {
            line.v5 = rule[5];
        }
        return line;
    };
    RedisAdapter.prototype.loadPolicyLine = function (line, model) {
        console.log("load Policies line called");
        var lineText = line.ptype;
        if (line.v0) {
            lineText += ", " + line.v0;
        }
        if (line.v1) {
            lineText += ", " + line.v1;
        }
        if (line.v2) {
            lineText += ", " + line.v2;
        }
        if (line.v3) {
            lineText += ", " + line.v3;
        }
        if (line.v4) {
            lineText += ", " + line.v4;
        }
        if (line.v5) {
            lineText += ", " + line.v5;
        }
        casbin_1.Helper.loadPolicyLine(lineText, model);
    };
    RedisAdapter.prototype.storePolicies = function (policies) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.log({ r: _this.redisInstance });
            _this.redisInstance.del('policies');
            _this.redisInstance.set('policies', JSON.stringify(policies), function (err, reply) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(reply);
                }
            });
        });
    };
    RedisAdapter.prototype.reducePolicies = function (policies, ptype, rule) {
        var i = rule.length;
        var policyIndex = policies.fieldIndex(function (policy) {
            var flag = false;
            flag = policy.ptype === ptype ? true : false;
            flag = i > 5 && policy.v5 === rule[5] ? true : false;
            flag = i > 4 && policy.v4 === rule[4] ? true : false;
            flag = i > 3 && policy.v3 === rule[3] ? true : false;
            flag = i > 2 && policy.v2 === rule[2] ? true : false;
            flag = i > 1 && policy.v0 === rule[1] ? true : false;
            return flag;
        });
        if (policyIndex !== -1) {
            return policies.splice(policyIndex, 1);
        }
        return [];
    };
    RedisAdapter.newAdapter = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var adapter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        adapter = new RedisAdapter(options);
                        return [4 /*yield*/, new Promise(function (resolve) { return adapter.redisInstance.on('connect', resolve); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, adapter];
                }
            });
        });
    };
    /**
     * Adapter Methods
     */
    RedisAdapter.prototype.loadPolicy = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.redisInstance.get("policies", function (err, policies) {
                    var AdapterRef = _this;
                    console.log("Loading Policies...\n", policies);
                    if (!err) {
                        policies = JSON.parse(policies);
                        _this.policies = policies; //For add and remove policies methods
                        console.log(policies);
                        policies.forEach(function (policy, index) {
                            AdapterRef.loadPolicyLine(policy, model);
                        });
                        console.log("Policies are loaded");
                    }
                    else {
                        return err;
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.loadFilteredPolicy = function (model, filter) {
        return __awaiter(this, void 0, void 0, function () {
            var key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = filter['hashKey'];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                var _this = this;
                                this.redisInstance.hgetall(key, function (err, policies) {
                                    var AdapterRef = _this;
                                    console.log("Loading filtered Policies...\n", policies);
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        resolve(policies);
                                        policies = JSON.parse(policies);
                                        _this.policies = policies; //For add and remove policies methods
                                        console.log(policies);
                                        policies.forEach(function (policy, index) {
                                            AdapterRef.loadPolicyLine(policy, model);
                                        });
                                        console.log("Filtered Policies are loaded...");
                                        _this.filtered = true;
                                    }
                                });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RedisAdapter.prototype.savePolicy = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var policyRuleAST, groupingPolicyAST, policies, _i, _a, _b, ptype, ast, _c, _d, rule, line, _e, _f, _g, ptype, ast, _h, _j, rule, line;
            var _this = this;
            return __generator(this, function (_k) {
                policyRuleAST = model.model.get("p");
                groupingPolicyAST = model.model.get("g");
                policies = [];
                //var rows2 = <Array<any>>policyRuleAST;
                //var rows2 = <Array<any>>groupingPolicyAST;
                for (_i = 0, _a = Object.entries(policyRuleAST); _i < _a.length; _i++) {
                    _b = _a[_i], ptype = _b[0], ast = _b[1];
                    for (_c = 0, _d = ast.policy; _c < _d.length; _c++) {
                        rule = _d[_c];
                        line = this.savePolicyLine(ptype, rule);
                        policies.push(line);
                    }
                }
                for (_e = 0, _f = Object.entries(groupingPolicyAST); _e < _f.length; _e++) {
                    _g = _f[_e], ptype = _g[0], ast = _g[1];
                    for (_h = 0, _j = ast.policy; _h < _j.length; _h++) {
                        rule = _j[_h];
                        line = this.savePolicyLine(ptype, rule);
                        policies.push(line);
                    }
                }
                //this.storePolicies(policies);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        console.log({ r: _this.redisInstance });
                        _this.redisInstance.del('policies');
                        _this.redisInstance.set('policies', JSON.stringify(policies), function (err, reply) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    })];
            });
        });
    };
    RedisAdapter.prototype.addPolicy = function (sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var line;
            return __generator(this, function (_a) {
                line = this.savePolicyLine(ptype, rule);
                this.policies.push(line);
                this.storePolicies(this.policies);
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.removePolicy = function (sec, ptype, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = this.reducePolicies(this.policies, ptype, rule);
                //the modified policies
                if (result.length) { //if length>0
                    this.policies = result;
                    //Store in Redis
                    this.storePolicies(this.policies);
                }
                else {
                    // console.IN("No Policy found");
                    throw new Error("No Policy Found");
                }
                return [2 /*return*/];
            });
        });
    };
    RedisAdapter.prototype.removeFilteredPolicy = function (sec, ptype, fieldIndex) {
        var fieldValues = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            fieldValues[_i - 3] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Method not implemented");
            });
        });
    };
    return RedisAdapter;
}());
exports.RedisAdapter = RedisAdapter;
