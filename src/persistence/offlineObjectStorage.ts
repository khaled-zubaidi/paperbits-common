import * as Utils from "../utils";
import * as _ from "lodash";
import { IObjectStorage } from "../persistence/IObjectStorage";
import { LruCache } from "../caching/lruCache";
import { IObjectStorageMiddleware } from "./IObjectStorageMiddleware";


export class OfflineObjectStorage implements IObjectStorage {
    private underlyingStorage: IObjectStorage;      // for storage
    private readonly stateObject: Object;
    private readonly changesObject: Object;

    private middlewares: IObjectStorageMiddleware[];

    public isOnline: boolean;

    constructor() {
        this.stateObject = {};
        this.changesObject = {};
        this.underlyingStorage = null;
        this.isOnline = true;
        this.middlewares = [];
    }

    public registerUnderlyingStorage(underlyingStorage: IObjectStorage): void {
        this.underlyingStorage = underlyingStorage;
    }

    public registerMiddleware(middleware: IObjectStorageMiddleware): void {
        this.middlewares.push(middleware);
    }

    private convertToSearchParam(propertyNames: string[], searchValue: string): Object[] {
        return propertyNames.map(name => {
            const prop = {};
            prop[name] = searchValue;
            return prop;
        });
    }

    private searchPropertyInObject(searchProps: {}[], startAtSearch: boolean, matchedObj: any) {
        return _.find(searchProps, (prop) => {
            if (startAtSearch) {
                const propName = _.keys(prop)[0];
                const test = matchedObj[propName];

                return test && test.toUpperCase().startsWith(prop[propName].toUpperCase());
            }
            else {
                return _.isMatch(matchedObj, prop);
            }
        });
    }

    private setStateObjectAt(key: string, source: Object): void {
        Utils.mergeDeepAt(key, this.stateObject, Utils.clone(source));
    }

    private setChangesObjectAt(key: string, source: Object): void {
        Utils.cleanupObject(source);
        Utils.mergeDeepAt(key, this.changesObject, Utils.clone(source));
    }

    public async addObject(key: string, dataObject: Object): Promise<void> {
        if (!key) {
            throw new Error("Could not add object: Key is undefined.");
        }

        this.setChangesObjectAt(key, dataObject);
        this.setStateObjectAt(key, dataObject);

        this.saveChanges();
    }

    public async updateObject<T>(key: string, dataObject: T): Promise<void> {
        if (!key) {
            throw new Error("Could not update object: Key is undefined.");
        }

        // const promises = this.middlewares.map(x => x.applyChanges(key, dataObject));
        // await Promise.all(promises);

        this.setChangesObjectAt(key, dataObject);
        this.setStateObjectAt(key, dataObject);

        this.saveChanges();
    }

    public async getObject<T>(key: string): Promise<T> {
        if (!key) {
            throw new Error("Path is undefined.");
        }

        const cachedItem = Utils.getObjectAt<T>(key, this.stateObject);

        if (cachedItem) {
            return Promise.resolve<T>(cachedItem);
        }

        const result = await this.underlyingStorage.getObject<T>(key);

        if (result) {
            this.setStateObjectAt(key, result);
        }

        return result;
    }

    public async deleteObject(key: string): Promise<void> {
        Utils.setValue(key, this.changesObject, null);
        Utils.setValue(key, this.stateObject, null);

        this.saveChanges();
    }

    public async searchObjects<T>(path: string, propertyNames?: string[], searchValue?: string, startAtSearch?: boolean): Promise<T[]> {
        let resultObject = {};

        if (this.isOnline) {
            const searchResultObject = await this.underlyingStorage.searchObjects<T>(path, propertyNames, searchValue, startAtSearch);

            Utils.mergeDeep(searchResultObject, Utils.clone(this.changesObject));
            Utils.mergeDeep(this.stateObject, Utils.clone(searchResultObject));

            Utils.cleanupObject(searchResultObject);

            resultObject = Utils.getObjectAt(path, searchResultObject);
        }

        return Object.keys(resultObject).map(x => resultObject[x]);
    }

    public async saveChanges(): Promise<void> {
        await this.underlyingStorage.saveChanges(this.changesObject);
        Object.keys(this.changesObject).forEach(key => delete this.changesObject[key]);
        console.log("Saved.");
    }
}
