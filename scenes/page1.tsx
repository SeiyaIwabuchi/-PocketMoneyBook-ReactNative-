import { View, Text, FlatList } from "react-native";
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native' ;
import { Header, ListItem } from "react-native-elements";
import normalize from '../normalize';
import BalanceData from '../BalanceData'
import {select} from "../DatabaseOperation";
import { NavigationParams, NavigationScreenProp, NavigationState } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';
import {Dimensions} from 'react-native';
import * as Animatable from 'react-native-animatable';
import * as Progress from 'react-native-progress';

interface IProps {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

function getColorAmount(available:number,income:number){
    let r = Math.floor(186 + ((1 - (income/available)) * 69));
    r = isNaN(r)?186:r;
    r = r > 255?255:r;
    let sr = r < 16?"0" + r.toString(16):r.toString(16);
    let g = Math.floor(186 + ((income/available)*48));
    g = isNaN(g)?234:g;
    g = g < 186?186:g;
    let sg = g < 16?"0" + g.toString(16):g.toString(16);
    let b = Math.floor(186 + ((income/available)*69));
    b = isNaN(b)?255:b;
    b = b < 186?186:b;
    let sb = b < 16?"0" + b.toString(16):b.toString(16);
    return `#${sr}${sg}${sb}`
}

function getProgressColorAmount(available:number,income:number){
    let r = Math.floor(146 + ((1 - (income/available)) * 68));
    r = isNaN(r)?146:r;
    r = r > 214?214:r;
    let sr = r < 16?"0" + r.toString(16):r.toString(16);
    let g = Math.floor(146 + ((income/available)*48));
    g = isNaN(g)?194:g;
    g = g < 194?194:g;
    let sg = g < 16?"0" + g.toString(16):g.toString(16);
    let b = Math.floor(146 + ((income/available)*68));
    b = isNaN(b)?194:b;
    b = b < 194?194:b;
    let sb = b < 16?"0" + b.toString(16):b.toString(16);
    return `#${sr}${sg}${sb}`
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
	setThisMonthSetter: (price:number) => void,
	setThisWeek: (price:number) => void,
    setToday: (price:number) => void,
    setThisMonthAvailable:(price:number)=>void,
    setThisWeekAvailable:(price:number)=>void,
    setTodayAvailable:(price:number)=>void
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
                daysLeftThisMonth += firstDateOfTheMonth - 1;
			} else {
                daysLeftThisMonth = toDay.getDate() - firstDateOfTheMonth;
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
						let recDate = balanceData.date;
						if (isNaN(price) === false) {
							if (balanceData.kind === "収入") balance += price;
							else {
								if (balanceData.date.getFullYear() === toDay.getFullYear() && 
                                    balanceData.date.getMonth() === toDay.getMonth() && 
                                    balanceData.date.getDate() === toDay.getDate()) {
									spendingToday += price;
                                }
                                const balanceDataDate = balanceData.date;
								if (
                                    getWeekNumber(toDay, firstDayOfTheWeek) === getWeekNumber(balanceDataDate, firstDayOfTheWeek) && 
                                    getAdjustedMonth(balanceDataDate,firstDateOfTheMonth) === getAdjustedMonth(new Date(),firstDateOfTheMonth)
                                    ) {
								}
								if (getAdjustedMonth(recDate, firstDateOfTheMonth) >= getAdjustedMonth(toDay, firstDateOfTheMonth)) {
									spendingThisMonth += price;
								}
							}
						}
					});
					let moneyAvailableThisMonth = balance;
					setThisMonthSetter(moneyAvailableThisMonth - spendingThisMonth);
					moneyAvailableToday = Math.floor((moneyAvailableThisMonth - spendingThisMonth + spendingToday) / daysLeftThisMonth);
					moneyAvailableThisWeek = Math.floor(moneyAvailableToday * daysLeftThisWeek);
					setToday(moneyAvailableToday - spendingToday);
                    setThisWeek(moneyAvailableThisWeek  - spendingToday);
                    setThisMonthAvailable(moneyAvailableThisMonth);
                    setThisWeekAvailable(moneyAvailableThisWeek);
                    setTodayAvailable(moneyAvailableToday);
				});
		});

}

export default function page1(props: IProps) {
    const [balanceDataList,setBalanceDataList] = useState<BalanceData[]>([]);
    const [thisMonth,setThisMonth] = useState(0);
    const [thisWeek,setThisWeek] = useState(0);
    const [today,setThisToday] = useState(0);
    const [monthAvailable,setMonthAvailable] = useState(0);
    const [weekAvailabale,setWeekAvailabale] = useState(0);
    const [todayAvailable,setTodayAvailable] = useState(0);
    const [todayColor,setTodayColor] = useState("");
    const [weekColor,setWeekColor] = useState("");
    const [monthColor,setMonthColor] = useState("");
    const renderItem = ({ item }: { item: BalanceData }) => (
        <ListItem bottomDivider onPress={()=>{
            AsyncStorage.setItem("currentItemId",item.id.toString(),(error)=>{console.log(error)});
            props.navigation.navigate("INPUT");
        }}>
            <ListItem.Content style={{ flexDirection: "row" }}>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{`${item.date.getMonth()+1}/${item.date.getDate()}`}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{item.kind}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{item.content}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{"￥" + item.price}</Text>
            </ListItem.Content>
        </ListItem>
    );
    const keyExtractor = (item: BalanceData, index: number) => index.toString();
    useFocusEffect(
        React.useCallback(()=>{
            select(setBalanceDataList,(list:BalanceData[])=>{
                calcBalance(list,setThisMonth,setThisWeek,setThisToday,setMonthAvailable,setWeekAvailabale,setTodayAvailable);
            });
        },[])
    );
    return (
        <View style={{height:"100%"}}>
            <Header
                placement={"left"}
                centerComponent={{ text: "お貧乏様", style: { fontSize: 25 } }}
                containerStyle={{height:"12%"}}
			/>
            <View style={{height:"43%",justifyContent:"space-around"}}>
                <Animatable.View animation="fadeInRight" delay={0} ref={(ref)=>{}}>
                    <View style={{alignItems:"flex-start",borderWidth:1,margin:"2%",backgroundColor:getColorAmount(todayAvailable,today),borderColor:"#a3a3a3",borderRadius:20}}>
                        <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                            <Text style={{borderWidth:0,fontSize:normalize(20),marginLeft:"3%",marginTop:"2%"}}>今日使える金額</Text>
                            <Progress.Bar progress={todayAvailable===0?0:(today/todayAvailable)} width={180} height={20} style={{alignSelf:"center",marginRight:"5%"}} color={getProgressColorAmount(todayAvailable,today)}/>
                        </View>
                            <Text style={{borderWidth:0,fontSize:normalize(50),marginLeft:"3%"}}>{`￥${today}`}</Text>
                    </View>
                </Animatable.View>
                <Animatable.View animation="fadeInRight" delay={100}>
                <View style={{alignItems:"flex-start",borderWidth:1,margin:"2%",backgroundColor:getColorAmount(weekAvailabale,thisWeek),borderColor:"#a3a3a3",borderRadius:20}}>
                    <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                        <Text style={{borderWidth:0,fontSize:normalize(18),marginLeft:"3%",marginTop:"2%"}}>今週使える金額</Text>
                        <Progress.Bar progress={weekAvailabale===0?0:(thisWeek/weekAvailabale)} width={180} height={20} style={{alignSelf:"center",marginRight:"5%"}} color={getProgressColorAmount(weekAvailabale,thisWeek)}/>
                    </View>
                        <Text style={{fontSize:normalize(40),marginLeft:"3%"}}>{`￥${thisWeek}`}</Text>
                </View>
                </Animatable.View>
                <Animatable.View animation="fadeInRight" delay={200}>
                <View style={{alignItems:"flex-start",borderWidth:1,margin:"2%",backgroundColor:getColorAmount(monthAvailable,thisMonth),borderColor:"#a3a3a3",borderRadius:20}}>
                    <View style={{width:"100%",flexDirection:"row",justifyContent:"space-between"}}>
                        <Text style={{borderWidth:0,fontSize:normalize(18),marginLeft:"3%",marginTop:"2%"}}>今月使える金額</Text>
                        <Progress.Bar progress={monthAvailable===0?0:(thisMonth/monthAvailable)} width={180} height={20} style={{alignSelf:"center",marginRight:"5%"}} color={getProgressColorAmount(monthAvailable,thisMonth)}/>
                    </View>
                        <Text style={{fontSize:normalize(40),marginLeft:"3%"}}>{`￥${thisMonth}`}</Text>
                </View>
                </Animatable.View>
            </View>
            <View style={{height:"45%"}}>
                <FlatList 
                keyExtractor={keyExtractor} 
                data={balanceDataList} 
                renderItem={renderItem} 
                style={{ width: "100%"}}
                ListHeaderComponent={
                    <ListItem bottomDivider>
                        <ListItem.Content style={{ flexDirection: "row" }}>
                            <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{"日付"}</Text>
                            <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{"種類"}</Text>
                            <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{"事柄"}</Text>
                            <Text style={{ textAlign: "center", width: "25%", fontSize: normalize(25) }}>{"金額"}</Text>
                        </ListItem.Content>
                    </ListItem>
                }
                stickyHeaderIndices={[0]}
                />
            </View>
        </View>
    );
}