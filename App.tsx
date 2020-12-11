import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Pages1 from './scenes/page1';
import Pages2 from './scenes/page2';
import Pages3 from './scenes/page3';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import {createTable} from './DatabaseOperation';
  

function initDB(){
	//deleteTable(); //テーブル削除
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
	const [] = useState(0);
	let tabList: JSX.Element[] = [];
	PageIcons.forEach((pageicon) => {
		tabList.push(<Tab.Screen name={pageicon.pageName} component={pageicon.component}/>);
	});
	useEffect(()=>{
		console.log("ようこそ！");
		initDB();
	},[]);
	return (
		<View style={{ height: "99%" }}>
			<NavigationContainer>
				<Tab.Navigator initialRouteName={"HOME"} screenOptions={
					({ route }) => ({
						tabBarIcon: ({ color, size }) => {
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


