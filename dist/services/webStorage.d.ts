import { EventEmitter } from '@angular/core';
import { IStorage } from '../interfaces';
import { STORAGE } from '../enums/storage';
export declare class WebStorageService implements IStorage {
    private sType;
    constructor(sType?: STORAGE);
    store(raw: string, value: any, json?: boolean): void;
    retrieve(raw: string): any;
    clear(raw?: string): void;
    observe(raw: string): EventEmitter<any>;
    isStorageAvailable(): boolean;
}
