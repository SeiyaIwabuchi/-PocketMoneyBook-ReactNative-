import * as SQLite from 'expo-sqlite';
import React from 'react';
import DatabaseConfig from './DatabaseConfig';
import BalanceData from './BalanceData';

export function createTable() {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			"create table if not exists " + DatabaseConfig.tableNames[0] + "(" +
			"id integer primary key not null," +
			"date text," +
			"kind text," +
			"content text," +
			"price text" +
			")",
			undefined,
			() => {
				console.log("create table success");
				console.log(`Table:${DatabaseConfig.tableNames[0]}`);
			},
			(error) => {
				console.log("create table error");
				console.log(error);
				return false;
			}
		);
	});
}

export function deleteTable() {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			`drop table ${DatabaseConfig.tableNames[0]};`,
			undefined,
			() => {
				console.log("delete table success");
				console.log(`Table:${DatabaseConfig.tableNames[0]}`);
			},
			(tx,error) => {
				console.log("delete table error");
				console.log(error);
				return false;
			}
		);
	});
}

export function select(setDataHandle: (t: BalanceData[]) => void, successCallBack: (list: BalanceData[]) => void, filter?: string) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	let list: BalanceData[] = [];
	console.log(`select * from ${DatabaseConfig.tableNames[0]} ${filter === undefined ? "" : `where ${filter}`}`);
	db.transaction((tx) => {
		tx.executeSql(
			`select * from ${DatabaseConfig.tableNames[0]} ${filter === undefined ? "" : `where ${filter}`} order by date desc`,
			undefined,
			(_, { rows: SQLResultSetRowList }) => {
				for (let i = 0; i < SQLResultSetRowList.length; i++) {
					let trow:{date:string,kind:string,content:string,price:string,id:string} = SQLResultSetRowList.item(i);
					 list.push(new BalanceData(
						new Date(parseInt(trow.date)),
						trow.kind,
						trow.content,
						trow.price,
						parseInt(trow.id)
					));
				}
				setDataHandle(list);
				successCallBack(list);
			}
		);
	},
		(error) => {
			console.log(error);
			setDataHandle(list);
		},
		() => {
			console.log("get success");
		}
	);
}

export function insertToDb(row: BalanceData) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	const sql =
		`insert into ${DatabaseConfig.tableNames[0]} values(${row.id},'${row.date.getTime()}','${row.kind}','${row.content}',${row.price})`;
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

export function deleteById(successCallBack: () => void, filter: string) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	console.log(`delete from ${DatabaseConfig.tableNames[0]} where ${filter}`);
	if (filter !== "") {
		db.transaction((tx) => {
			tx.executeSql(
				`delete from ${DatabaseConfig.tableNames[0]} where ${filter}`,
				undefined,
				(_, { }) => {
					successCallBack();
				},
				(tr,error)=>{ console.log(error); return false;}
			);
		},
			(error) => {
				console.log(error)
			},
			() => {
				console.log("success delete a row");
			}
		);
	}
}

export function update(data:BalanceData) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			"update " + DatabaseConfig.tableNames[0] + 
			" set " + 
			`date = '${data.date.getTime()}',` +
			`kind = '${data.kind}',` +
			`content = '${data.content}',` +
			`price = '${data.price}'`  + 
			`where id = ${data.id}`,
			undefined,
			() => {
				console.log("update success");
				console.log(`Table:${DatabaseConfig.tableNames[0]}`);
			},
			(tx,error) => {
				console.log("update error");
				console.log(error);
				console.log(
					"update " + DatabaseConfig.tableNames[0] + 
					"set " + 
					`date = '${data.date}',` +
					`kind = '${data.kind}',` +
					`content = '${data.content}',` +
					`price = '${data.price}'`  + 
					`where id = ${data.id}`);
				return false;
			}
		);
	});
}

export function getMaxId(successCallBack: (result:{maxId:number}) => void) {
	const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			`select max(id) as 'maxId' from ${DatabaseConfig.tableNames};`,
			undefined,
			(_, { rows: SQLResultSetRowList }) => {
				successCallBack(SQLResultSetRowList.item(0));
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