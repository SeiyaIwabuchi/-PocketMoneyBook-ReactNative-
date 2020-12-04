import { View, Text, FlatList, PixelRatio, Dimensions, Platform, ImageBackground } from "react-native";
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native' ;
import { Avatar, Header, ListItem } from "react-native-elements";
import normalize from '../normalize';
import * as SQLite from 'expo-sqlite';
import BalanceData from '../BalanceData'
import IBalanceData from "../IBalanceData";
import {select} from "../DatabaseOperation";
import { NavigationParams, NavigationScreenProp, NavigationState } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';
import Icons from 'react-native-vector-icons/MaterialIcons';

interface IProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

function calcBalance(
    balanceDataList:BalanceData[],
    setThisMonthSetter:(text:string)=>void,
    setThisWeek:(text:string)=>void,
    setToday:(text:string)=>void
    ){
    let balance = 0;
    let toDay = new Date();
    let daysLeftThisMonth = new Date(toDay.getFullYear(),toDay.getMonth() + 1, 0).getDate() - toDay.getDate() + 1; //今月の残り日数（当日を含む）
    let daysLeftThisWeek = 7 - toDay.getDay();
    balanceDataList.forEach((balanceData)=>{
        let price = parseInt(balanceData.price);
        if(isNaN(price) === false){
            if(balanceData.kind === "収入") balance += price;
            else balance -= price;
        }
    });
    setThisMonthSetter("￥" + (balance.toString()));
    setThisWeek(`￥${Math.floor((balance/daysLeftThisMonth)*daysLeftThisWeek).toString()}`)
    setToday(`￥${Math.floor(balance/daysLeftThisMonth).toString()}`);
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
    const keyExtractor = (item: IBalanceData, index: number) => index.toString()
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