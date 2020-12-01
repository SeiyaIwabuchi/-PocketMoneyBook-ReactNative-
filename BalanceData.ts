import React from 'react'
import IBlanceData from './IBalanceData'

class BalanceData implements IBlanceData{
    date = "";
    kind = "out";
    content = "";
    price = "";
    id = 0;
    static count = 0;
    constructor(data:string,kind:string,content:string,price:string,id?:number){
        if(id === undefined){
            this.id = BalanceData.count;
            BalanceData.count++;
        }
        this.date = data;
        this.kind = kind;
        this.content = content;
        this.price = price;
    }
}

export default BalanceData;