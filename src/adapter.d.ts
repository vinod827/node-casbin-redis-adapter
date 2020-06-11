import { Model, FilteredAdapter } from 'casbin';
interface IConnectionOptions {
    host: string;
    port: number;
}
declare class Line {
    ptype: string;
    v0: string;
    v1: string;
    v2: string;
    v3: string;
    v4: string;
    v5: string;
}
export declare class RedisAdapter implements FilteredAdapter {
    private redisInstance;
    private policies;
    private filtered;
    isFiltered(): boolean;
    private deliveredOptions;
    savePolicyLine(ptype: any, rule: any): Line;
    loadPolicyLine(line: any, model: any): void;
    storePolicies(policies: any): Promise<unknown>;
    reducePolicies(policies: any, ptype: any, rule: any): any;
    constructor(options: IConnectionOptions);
    static newAdapter(options: IConnectionOptions): Promise<RedisAdapter>;
    loadPolicy(model: any): Promise<void>;
    loadFilteredPolicy(model: Model, filter: object): Promise<void>;
    savePolicy(model: Model): Promise<boolean>;
    addPolicy(sec: any, ptype: any, rule: any): Promise<void>;
    removePolicy(sec: any, ptype: any, rule: any): Promise<void>;
    removeFilteredPolicy(sec: string, ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<void>;
}
export {};
