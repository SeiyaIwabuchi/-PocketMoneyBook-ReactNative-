import React from 'react';
import BalanceData from "./BalanceData";

export class ValidationResult{
    isResult = false;
    errorText = "";
    constructor(res:boolean,err:string){
        this.isResult = res;
        this.errorText = err;
    }
}

export function validation(data:BalanceData){
    let isValid  = true;
    let errorText = "";
    if(isNaN(parseInt(data.price))){
        errorText += "金額が不正です。\n";
        isValid = false;
    }
    if(data.content === ""){
        errorText += "事柄を入力してください。\n"
        isValid = false;
    }
    return new ValidationResult(isValid,errorText);
}