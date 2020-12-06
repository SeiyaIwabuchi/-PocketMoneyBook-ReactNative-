import React from 'react'

class BalanceData{
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
        }else{
            this.id = id;
        }
        this.date = data;
        this.kind = kind;
        this.content = content;
        this.price = price;
    }
}

export default BalanceData;