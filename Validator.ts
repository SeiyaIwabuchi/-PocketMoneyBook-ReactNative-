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
    let tDate = data.date.split("/");
    if(isNaN(parseInt(tDate[0])) || isNaN(parseInt(tDate[1])) || 1 > parseInt(tDate[0]) || parseInt(tDate[1]) > 12){
        errorText += "日付が不正です。\n";
        isValid = false;
    }
    return new ValidationResult(isValid,errorText);
}