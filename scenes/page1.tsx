import { View, Text, FlatList, PixelRatio, Dimensions, Platform, ImageBackground } from "react-native";
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native' ;
import { Avatar, Header, ListItem } from "react-native-elements";
import normalize from '../normalize';
import * as SQLite from 'expo-sqlite';
import BalanceData from '../BalanceData'
import {select} from "../DatabaseOperation";
import { NavigationParams, NavigationScreenProp, NavigationState } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';
import Icons from 'react-native-vector-icons/MaterialIcons';

interface IProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

function getAdjustedMonth(d:Date,firstDateOfTheMonth:number){
    let month = 0;
    if(d.getDate() >= firstDateOfTheMonth){
        month = d.getMonth();
    }else{
        month = d.getMonth()-1;
    }
    return month;
}

function getWeekNumber(d:Date,firstDayOfTheWeek:number){
    let weeklyAdjustmentList = weeklyAdjustment(firstDayOfTheWeek);
	let date = d.getDate();
    let day = weeklyAdjustmentList[d.getDay()];
    let theFirstDayOfTheMonth = new Date(d.getFullYear(),d.getMonth(),1).getDay(); //2
    return (date - (day - theFirstDayOfTheMonth + 1)) / 7;
}
function weeklyAdjustment(firstDayOfTheWeek:number){
    //[1,2,3,4,5,6,7]
    let list:number[] = [];
    for(let i=firstDayOfTheWeek;i<7+firstDayOfTheWeek;i++){
        list.push(i);
    }
    let list2:number[] = [];
    for(let i=7-firstDayOfTheWeek;i<7-firstDayOfTheWeek+7;i++){
        list2.push(list[i%7]);
    }
    return list2;
}

function calcBalance(
	balanceDataList: BalanceData[],
	setThisMonthSetter: (text: string) => void,
	setThisWeek: (text: string) => void,
	setToday: (text: string) => void
) {
	let balance = 0;
	let toDay = new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
	let daysLeftThisMonth = new Date(toDay.getFullYear(), toDay.getMonth() + 1, 0).getDate() - toDay.getDate() + 1; //今月の残り日数（当日を含む）
	let daysLeftThisWeek = 7 - toDay.getDay();
	let firstDateOfTheMonth = 0;
	let firstDayOfTheWeek = 0;
	let moneyAvailableToday = 0;
	let moneyAvailableThisWeek = 0;
	let spendingToday = 0;
	let spendingThisWeek = 0;
	let spendingThisMonth = 0;
	AsyncStorage.getItem("firstDateOfTheMonth") //月始めの日付を取得
		.then((day) => {
			let fdotm: string;
			if (day !== null) {
				fdotm = day;
			} else {
				fdotm = "1";
			}
			firstDateOfTheMonth = parseInt(fdotm);
			if (toDay.getDate() > firstDateOfTheMonth) {
				daysLeftThisMonth += firstDateOfTheMonth;
			} else {
				daysLeftThisMonth = firstDateOfTheMonth - toDay.getDate();
			}
			AsyncStorage.getItem("firstDayOfTheWeek")
				.then((day) => {
					let fdotw: string;
					if (day !== null) {
						fdotw = day;
					} else {
						fdotw = "0";
					}
					firstDayOfTheWeek = parseInt(fdotw);
					if (toDay.getDay() >= firstDayOfTheWeek) {
						daysLeftThisWeek = 8 - toDay.getDay();
						if (getWeekNumber(toDay, firstDayOfTheWeek) ===
							getWeekNumber(new Date(toDay.getFullYear(), getAdjustedMonth(toDay, firstDateOfTheMonth) + 1, 11), firstDayOfTheWeek)
						) {
							daysLeftThisWeek = firstDateOfTheMonth - toDay.getDate();
						}
					} else {
						daysLeftThisWeek = firstDayOfTheWeek - toDay.getDay();
					}
					balanceDataList.forEach((balanceData) => {
						let price = parseInt(balanceData.price);
						let recDate = new Date(`${new Date().getFullYear()}/${balanceData.date}`);
						if (isNaN(price) === false) {
							if (balanceData.kind === "収入") balance += price;
							else {
								if (new Date(`${new Date().getFullYear()}/${balanceData.date}`).getTime() === toDay.getTime()) {
									spendingToday += price;
                                }
                                const balanceDataDate = new Date(`${new Date().getFullYear()}/${balanceData.date}`);
								if (
                                    getWeekNumber(toDay, firstDayOfTheWeek) === getWeekNumber(balanceDataDate, firstDayOfTheWeek) && 
                                    getAdjustedMonth(balanceDataDate,firstDateOfTheMonth) === getAdjustedMonth(new Date(),firstDateOfTheMonth)
                                    ) {
                                    console.log(balanceDataDate);
                                    console.log(new Date(new Date().getFullYear(),getAdjustedMonth(balanceDataDate,firstDateOfTheMonth)+1,firstDateOfTheMonth));
									spendingThisWeek += price;
								}
								if (getAdjustedMonth(recDate, firstDateOfTheMonth) >= getAdjustedMonth(toDay, firstDateOfTheMonth)) {
									spendingThisMonth += price;
								}
							}
						}
					});
					let moneyAvailableThisMonth = balance;
					setThisMonthSetter(`￥${moneyAvailableThisMonth - spendingThisMonth}`);
					moneyAvailableToday = Math.floor((moneyAvailableThisMonth - spendingThisMonth + spendingToday) / daysLeftThisMonth);
					moneyAvailableThisWeek = Math.floor(moneyAvailableToday * daysLeftThisWeek);
					setToday(`￥${moneyAvailableToday - spendingToday}`);
					setThisWeek(`￥${moneyAvailableThisWeek  - spendingToday}`);

				});
		});

}

export default function page1(props: IProps) {
    const [balanceDataList,setBalanceDataList] = useState<BalanceData[]>([]);
    const [thisMonth,setThisMonth] = useState("￥0");
    const [thisWeek,setThisWeek] = useState("￥0");
    const [today,setThisToday] = useState("￥0");
    const renderItem = ({ item }: { item: BalanceData }) => (
        <ListItem bottomDivider onPress={()=>{
            AsyncStorage.setItem("currentItemId",item.id.toString(),(error)=>{console.log(error)});
            props.navigation.navigate("INPUT");
        }}>
            <ListItem.Content style={{ flexDirection: "row" }}>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(20) }}>{item.date}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(20) }}>{item.kind}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(20) }}>{item.content}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(20) }}>{"￥" + item.price}</Text>
            </ListItem.Content>
        </ListItem>
    );
    const keyExtractor = (item: BalanceData, index: number) => index.toString()
    useFocusEffect(
        React.useCallback(()=>{
            select(setBalanceDataList,(list:BalanceData[])=>{
                calcBalance(list,setThisMonth,setThisWeek,setThisToday);
            });
        },[])
    );
    return (
        <View style={{ height: "100%" }}>{/* ページコンテナ */}
            <Header
				leftComponent={{ icon: "menu" }}
				centerComponent={{ text: "お貧乏様", style: { fontSize: 20 } }}
			/>
            <View style={{ alignItems: "center", justifyContent: "center", height: "45%" }}>{/* 金額表示コンテナ */}
                <View style={{ alignItems: "center", justifyContent: "center", height: "60%", width: "100%" }}>{/* 今日表示コンテナ */}
                    <View style={{ alignItems: "center", justifyContent: "flex-end", height: "30%", width: "100%" }}>
                        <Text style={{ fontSize: normalize(40) }}>{"今日"}</Text>
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center", height: "70%", width: "100%" }}>
                        <Text style={{ fontSize: normalize(100) }}>{today}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "center", height: "40%", width: "100%", flexDirection: "row" }}>{/*今月今週コンテナ */}
                    <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "50%" }}>{/* 今週コンテナ */}
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "30%" }}>
                            <Text style={{ fontSize: normalize(30) }}>{"今週"}</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "70%" }}>
                            <Text style={{ fontSize: normalize(60) }}>{thisWeek}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "50%" }}>{/* 今週コンテナ */}
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "30%" }}>
                            <Text style={{ fontSize: normalize(30) }}>{"今月"}</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "70%" }}>
                            <Text style={{ fontSize: normalize(60) }}>{thisMonth}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", height: "55%" }}>{/* リストコンテナ */}
                <FlatList keyExtractor={keyExtractor} data={balanceDataList} renderItem={renderItem} style={{ width: "100%" }} />
            </View>
        </View>
    );
}