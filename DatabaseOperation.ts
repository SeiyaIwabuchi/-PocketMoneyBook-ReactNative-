import React from 'react';
import * as SQLite from 'expo-sqlite';
import DatabaseConfig from './DatabaseConfig';
import BalanceData from './BalanceData';

export function createTable() {
    const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			"create table if not exists " + DatabaseConfig.tableName + "(" + 
				"id integer primary key not null," +
				"date text," +
                "kind text," +
                "content text," +
                "price text" +
                ")",
			undefined,
			() => {
				console.log("create table success");
				console.log(`Table:${DatabaseConfig.tableName}`);
			},
			(error) => {
				console.log("create table error");
				console.log(error);
				console.log(
					"create table if not exists " + DatabaseConfig.tableName + "(" + 
                "id integer primary key not null," +
                "kind text," +
                "content text," +
                "price text" +
                ")"
				)
				return false; 
			}
		);
	},
	(error) => {
		console.log("create table error");
		console.log(error);
	},
	() => {
		console.log("create table success");
	}
	);
}

export function deleteTable() {
    const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			`drop table ${DatabaseConfig.tableName};`,
			undefined,
			() => {
				console.log("create table success");
				console.log(`Table:${DatabaseConfig.tableName}`);
			},
			(error) => {
				console.log("create table error");
				console.log(error);
				return false; 
			}
		);
	},
	(error) => {
		console.log("create table error");
		console.log(error);
	},
	() => {
		console.log("create table success");
	}
	);
}

export function select(setDataHandle: (t: BalanceData[]) => void,successCallBack:(list:BalanceData[])=>void) {
    type model = typeof DatabaseConfig.model;
    const db = SQLite.openDatabase(DatabaseConfig.databaseName);
    let list:BalanceData[] = [];
    db.transaction((tx) => {
        tx.executeSql(
            "select * from " + DatabaseConfig.tableName,
            undefined,
            (_, { rows: SQLResultSetRowList }) => {
                list.push(new BalanceData("日付","種類","事柄","金額"));
                for (let i = 0; i < SQLResultSetRowList.length; i++) {
                    list.push(SQLResultSetRowList.item(i));
                }
                setDataHandle(list);
                successCallBack(list);
            }
        );
    },
        (error) => { 
            console.log(error)
        },
        () => {
            console.log("get success");
        }
    );
}

export function insertToDb(row: BalanceData) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
    const sql =
        `insert into ${DatabaseConfig.tableName} values(${row.id},'${row.date}','${row.kind}','${row.content}',${row.price})`;
	db.transaction((tx) => {
		tx.executeSql(
			sql
			,
			undefined,
			() => {
                console.log("insert success");
			},
			(tx, error) => {
                console.log(error);
				return false;
			}
		);
	},
		(error) => {
            console.log(error);
		},
    );
}

function calcBalance(balanceDataList:BalanceData[],setThisMonthSetter:(text:string)=>void){
    let balance = 0;
    balanceDataList.forEach((balanceData)=>{
        console.log("よびだされた！");
        let price = parseInt(balanceData.price);
        if(isNaN(price) === false){
            if(balanceData.kind === "収入") balance += price;
            else balance -= price;
        }
    });
    console.log(balance)
    setThisMonthSetter("￥" + (balance.toString()));
}