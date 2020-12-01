import React from 'react';
import IBalanceData from './IBalanceData';
import BalanceData from './BalanceData';
const list:IBalanceData[] = [
    new BalanceData("日付","種類","事柄","金額"),
    new BalanceData("10/8","支出","コーヒー","120"),
];

export default list;