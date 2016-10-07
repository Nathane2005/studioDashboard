import {
    Injectable,
    Inject
} from "@angular/core";
import {
    Actions,
    AppStore
} from "angular2-redux-util";
import {List} from "immutable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/finally";
import "rxjs/add/observable/throw";
import {Http} from "@angular/http";
import * as _ from "lodash";
import {AdnetCustomerModel} from "./AdnetCustomerModel";
import {AdnetRateModel} from "./AdnetRateModel";
import {AdnetTargetModel} from "./AdnetTargetModel";
import {AdnetPairModel} from "./AdnetPairModel";
import {AdnetPackageModel} from "./AdnetPackageModel";

export const RECEIVE_ADNET = 'RECEIVE_ADNET';
export const RECEIVE_CUSTOMERS = 'RECEIVE_CUSTOMERS';
export const RECEIVE_RATES = 'RECEIVE_RATES';
export const RECEIVE_TARGETS = 'RECEIVE_TARGETS';
export const RECEIVE_PAIRS = 'RECEIVE_PAIRS';
export const RECEIVE_PACKAGES = 'RECEIVE_PACKAGES';
export const UPDATE_ADNET_CUSTOMER = 'UPDATE_ADNET_CUSTOMER';
export const UPDATE_ADNET_RATE_TABLE = 'UPDATE_ADNET_RATE_TABLE';
export const UPDATE_ADNET_TARGET = 'UPDATE_ADNET_TARGET';
export const ADD_ADNET_TARGET = 'ADD_ADNET_TARGET';
export const ADD_ADNET_RATE_TABLE = 'ADD_ADNET_RATE_TABLE';
export const REMOVE_ADNET_RATE_TABLE = 'REMOVE_ADNET_RATE_TABLE';
export const REMOVE_ADNET_TARGET = 'REMOVE_ADNET_TARGET';
export const RENAME_ADNET_RATE_TABLE = 'RENAME_ADNET_RATE_TABLE';

@Injectable()
export class AdnetActions extends Actions {

    constructor(@Inject('OFFLINE_ENV') private offlineEnv, private appStore: AppStore, private _http: Http) {
        super(appStore);
    }

    private saveToServer(i_data, i_customerId, i_callBack?: (jData)=>void) {
        //todo: fix customer id, now its just fixed, i.e.: doesn't replace anything
        const data = JSON.stringify(i_data);
        const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnetSave').replace(':CUSTOMER_ID:', i_customerId).replace(':DATA:', data);
        this._http.get(baseUrl)
            .map(result => {
                var jData: Object = result.json()
                if (i_callBack) i_callBack(jData);
            }).subscribe()
    }

    public getAdnet() {
        return (dispatch) => {
            const adnetCustomerId = this.appStore.getState().appdb.get('adnetCustomerId');
            const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnet');
            const url = `${baseUrl}`;
            // offline not being used currently
            if (this.offlineEnv) {
                this._http.get('offline/customerRequest.json').subscribe((result) => {
                    var jData: Object = result.json();
                })
            } else {
                this._http.get(url)
                    .map(result => {
                        var jData: Object = result.json()
                        dispatch(this.receivedAdnet(jData));

                        /** Customers **/
                        var adnetCustomers: List<AdnetCustomerModel> = List<AdnetCustomerModel>();
                        for (var adnetCustomer of jData['customers']) {
                            const adnetCustomerModel: AdnetCustomerModel = new AdnetCustomerModel(adnetCustomer);
                            adnetCustomers = adnetCustomers.push(adnetCustomerModel)
                        }
                        dispatch(this.receivedCustomers(adnetCustomers));

                        /** Rates **/
                        var adnetRates: List<AdnetRateModel> = List<AdnetRateModel>();
                        for (var adnetRate of jData['rates']) {
                            if (adnetRate.Value.deleted == true)
                                continue;
                            const adnetRateModel: AdnetRateModel = new AdnetRateModel(adnetRate);
                            adnetRates = adnetRates.push(adnetRateModel)
                        }
                        dispatch(this.receivedRates(adnetRates));

                        /** Targets **/
                        var adnetTargets: List<AdnetTargetModel> = List<AdnetTargetModel>();
                        for (var target of jData['targets']) {
                            if (target.Value.deleted == true)
                                continue;
                            const adnetTargetModel: AdnetTargetModel = new AdnetTargetModel(target);
                            adnetTargets = adnetTargets.push(adnetTargetModel)
                        }
                        dispatch(this.receivedTargets(adnetTargets));

                        /** Pairs **/
                        var adnetPairModels: List<AdnetPairModel> = List<AdnetPairModel>();
                        for (var pair of jData['pairs']) {
                            const adnetPairModel: AdnetPairModel = new AdnetPairModel(pair);
                            adnetPairModels = adnetPairModels.push(adnetPairModel)
                        }
                        dispatch(this.receivedPairs(adnetPairModels));

                        /** Packages **/
                        var adnetPackageModels: List<AdnetPackageModel> = List<AdnetPackageModel>();
                        for (var pkg of jData['packages']) {
                            if (pkg.Value.deleted == true)
                                continue;
                            const adnetPackageModel: AdnetPackageModel = new AdnetPackageModel(pkg);
                            adnetPackageModels = adnetPackageModels.push(adnetPackageModel)
                        }
                        dispatch(this.receivedPackages(adnetPackageModels));

                    }).subscribe()
            }
        };
    }

    public saveCustomerInfo(data: Object, adnetCustomerId: string) {
        return (dispatch) => {
            const payload = {
                Value: {},
                Key: adnetCustomerId
            };
            payload.Value = {"customerInfo": data};
            this.saveToServer(payload.Value, adnetCustomerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return alert('problem saving customer info to server');
                payload.Value = data;
                dispatch(this.updateAdnetCustomer(payload))
            })
        };
    }

    public saveTargetInfo(data: Object, adnetTargetId: string) {
        return (dispatch) => {
            //todo: save to server
            const payload = {
                Value: data,
                Key: adnetTargetId
            };
            dispatch(this.updateAdnetTarget(payload))
        };
    }

    public addAdnetTarget(customerId) {
        return (dispatch) => {
            //todo: save to server
            //todo: get handle and id back from server on save
            var key = _.uniqueId();
            const model: AdnetTargetModel = new AdnetTargetModel({
                Key: key,
                Value: {
                    customerId: customerId,
                    daylightSavingType: 0,
                    id: key,
                    comments: '',
                    handle: _.uniqueId(),
                    deleted: false,
                    enabled: true,
                    hRate: '',
                    keys: '',
                    label: 'web target',
                    locationLng: 0,
                    locationLat: 0,
                    rateId: 0,
                    standardTimeOffset: 0,
                    targetDomain: 'example.com',
                    targetType: 2,
                    url: '',
                }
            });
            dispatch({
                type: ADD_ADNET_TARGET,
                model: model
            });
        };
    }


    public addAdnetRateTable(customerId) {
        return (dispatch) => {


            //todo: save to server
            //todo: get handle and id back from server on save
            // var key = _.uniqueId();
            var payload = {
                Key: -1,
                Value: {
                    customerId: customerId,
                    deleted: false,
                    id: 0,
                    handle: 0,
                    modified: 1,
                    hourRate0: 1,
                    hourRate1: 2,
                    hourRate2: 3,
                    hourRate3: 4,
                    label: 'new rate',
                    rateMap: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
                }
            }
            const model: AdnetRateModel = new AdnetRateModel(payload);

            var payloadToServer = {
                "rates": {
                    "add": [payload.Value]
                }
            }
            this.saveToServer(payloadToServer, customerId, (jData) => {
                if (_.isUndefined(!jData) || _.isUndefined(jData.fromChangelistId))
                    return alert('problem saving rate table to server');
                var newModel = model.setId(jData.rates.add["0"]);
                dispatch({
                    type: ADD_ADNET_RATE_TABLE,
                    model: newModel
                });
            })


        };
    }

    public removeAdnetRateTable(id) {
        return (dispatch) => {
            //todo: save to server
            dispatch({
                type: REMOVE_ADNET_RATE_TABLE,
                id: id
            });
        };
    }

    public removeAdnetTarget(id) {
        return (dispatch) => {
            //todo: save to server
            dispatch({
                type: REMOVE_ADNET_TARGET,
                id: id
            });
        };
    }

    public updAdnetRateTable(payload) {
        return (dispatch) => {
            //todo: save to server
            dispatch(this.updateAdnetRateTable(payload))
        };
    }

    public renameAdnetRateTable(rateId: string, newLabel: string) {
        return (dispatch) => {
            //todo: save to server
            dispatch({
                type: RENAME_ADNET_RATE_TABLE,
                payload: {
                    rateId,
                    newLabel
                }
            });
        };
    }

    public receivedAdnet(payload: any) {
        return {
            type: RECEIVE_ADNET,
            payload
        }
    }

    private updateAdnetRateTable(payload) {
        return {
            type: UPDATE_ADNET_RATE_TABLE,
            payload
        }
    }

    private updateAdnetCustomer(payload) {
        return {
            type: UPDATE_ADNET_CUSTOMER,
            payload
        }
    }

    private updateAdnetTarget(payload) {
        return {
            type: UPDATE_ADNET_TARGET,
            payload
        }
    }

    private receivedRates(rates: List<AdnetRateModel>) {
        return {
            type: RECEIVE_RATES,
            rates
        }
    }

    private receivedTargets(targets: List<AdnetTargetModel>) {
        return {
            type: RECEIVE_TARGETS,
            targets
        }
    }

    private receivedPairs(pairs: List<AdnetPairModel>) {
        return {
            type: RECEIVE_PAIRS,
            pairs
        }
    }

    private receivedPackages(packages: List<AdnetPackageModel>) {
        return {
            type: RECEIVE_PACKAGES,
            packages
        }
    }

    private receivedCustomers(customers: List<AdnetCustomerModel>) {
        return {
            type: RECEIVE_CUSTOMERS,
            customers
        }
    }
}
