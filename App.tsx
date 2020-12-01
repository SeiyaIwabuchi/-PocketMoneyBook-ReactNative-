import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pages1 from './scenes/page1';
import Pages2 from './scenes/page2';
import Pages3 from './scenes/page3';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import { Header } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';
import DatabaseConfig from './DatabaseConfig';

function createTable() {
    const db = SQLite.openDatabase(DatabaseConfig.databaseName);
	db.transaction((tx) => {
		tx.executeSql(
			"create table if not exists " + DatabaseConfig.tableName + "(" + 
                "id integer primary key not null," +
                "kind varchar(8)," +
                "content varchar(32)," +
                "price varchar(8)," +
                ")",
			undefined,
			() => { console.log("create table success") },
			(error) => { console.log(error); return false; }
		);
	},
		() => { console.log("create table fail") },
		() => { console.log("create table success") }
	);
}

function initDB(){
    createTable(); //テーブル作成
}

const Tab = createBottomTabNavigator();
const PageIcons = [
	{
		pageName: "HOME",
		iconName: "home",
		component: Pages1
	},
	{
		pageName: "INPUT",
		iconName: "create",
		component: Pages2
	},
	{
		pageName: "SETTINGS",
		iconName: "settings",
		component: Pages3
	},
];

export default function App() {
	const [refText,setRefText] = useState(0);
	let tabList: JSX.Element[] = [];
	PageIcons.forEach((pageicon) => {
		tabList.push(<Tab.Screen name={pageicon.pageName} component={pageicon.component}/>);
	});
	useEffect(()=>{
		initDB();
	},[]);
	return (
		<View style={{ height: "99%" }}>
			<Header
				leftComponent={{ icon: "menu" }}
				centerComponent={{ text: "お貧乏様", style: { fontSize: 20 } }}
				rightComponent={{ icon: "refresh" ,onPress:()=>{
					setRefText(Date.now());
				}}}
			/>
			<NavigationContainer>
				<Tab.Navigator initialRouteName={"INPUT"} screenOptions={
					({ route }) => ({
						tabBarIcon: ({ focused, color, size }) => {
							let iconName = "";
							PageIcons.forEach((pageicon) => {
								if (route.name === pageicon.pageName) {
									iconName = pageicon.iconName;
								}
							});

							return <Icons name={iconName} size={size} color={color} />
						}
					})
				}>
					{tabList}
				</Tab.Navigator>
			</NavigationContainer>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
