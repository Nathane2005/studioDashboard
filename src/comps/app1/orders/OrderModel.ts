import {StoreModel} from "../../../models/StoreModel";
import * as _ from "lodash";

/**
 * Thin wrapper of Immutable data around a single business
 * **/
export class OrderModel extends StoreModel {

    constructor(data:any = {}) {
        super(data);
    }

    public getTotal() {
        return this.getKey('amount');
    }

    public getOrderType():string {
        var orderId = this.getKey('order_id');
        if (_.isUndefined(orderId))
            return 'Enterp';
        return 'Cart';
    }

    public getDate():Date {
        var paymentDate = this.getKey('payment_date');
        if (_.isUndefined(paymentDate))
            paymentDate = this.getKey('order_date');
        return new Date(paymentDate)
    }

    public getOrderId() {
        var orderId = this.getKey('order_id');
        if (_.isUndefined(orderId))
            orderId = this.getKey('payment_id');
        return orderId;
    }
}