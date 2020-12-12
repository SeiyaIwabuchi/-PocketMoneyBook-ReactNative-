import React, { useState } from "react";
import { View, Picker, Text, Dimensions,Clipboard } from "react-native";
import { Button, Header, normalize } from "react-native-elements";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-community/async-storage";
import * as Db from '../DatabaseOperation';
import BalanceData from "../BalanceData";
import { Snackbar } from "react-native-paper";
import * as Updates from 'expo-updates';

export default function page3() {
	const [firstDateOfTheMonth, setFirstDateOfTheMonth] = useState(0);
	const [firstDayOfTheWeek, setFirstDayOfTheWeek] = useState(-1);
	const date = new Date();
	const lastDateOfTheMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	const [balanceDataList,setBalanceDataList] = useState<BalanceData[]>([]);
	const [visible,setVisible] = useState(false);
	const [snackbarText,setSnackbarText] = useState("");
	const [deleteTableCount,setDeleteTableCount] = useState(0);
	const [snackbarButtonText,setSnackbarButtonText] = useState("");
	const [isUpdateAvailable,setIsUpdateAvailable] = useState(false);
	useFocusEffect(
		React.useCallback(() => {
			AsyncStorage.getItem("firstDateOfTheMonth")
				.then((day) => {
					if (day != null) {
						setFirstDateOfTheMonth(parseInt(day));
					}
				});
			AsyncStorage.getItem("firstDayOfTheWeek")
				.then((date) => {
					if (date != null) {
						setFirstDayOfTheWeek(parseInt(date));
					}
				});
				Db.select(setBalanceDataList,(balalist)=>{});
				( async ()=> {try {
							const update = await Updates.checkForUpdateAsync();
							setIsUpdateAvailable(update.isAvailable);
							} catch (e) {
							// handle or log error
								console.log("confirm updates error");
								console.log(e);
							}
						}
				)();
		}, [])
	);
	return (
		<View style={{ width: "100%", height: "85%" }}>
			<Header
				placement={"left"}
				centerComponent={{ text: "お貧乏様", style: { fontSize: 25 } }}
				containerStyle={{shadowOpacity:1,shadowRadius:0,shadowOffset:{width:0,height:1},shadowColor:"#ccc",elevation:2}}
			/>
			<View style={{ alignItems: "center", justifyContent: "center", height: "100%", padding: "1%" }}>
				<View style={{ height: "100%", width: "100%", padding: "10%" }}>
					<View style={{flexDirection:"row",height:"10%",width:"100%",justifyContent:"space-between",marginBottom:"3%",alignItems:"center"}}>
						<Text style={{fontSize:normalize(15)}}>{"月始め日"}</Text>
						<Picker style={{
							width:"30%"
						}}
							selectedValue={firstDateOfTheMonth}
							onValueChange={(item) => {
								setFirstDateOfTheMonth(parseInt(item));
								AsyncStorage.setItem("firstDateOfTheMonth", `${item}`);
							}}
						>
							<Picker.Item label={"月初めの日"} value={0} />
							{(() => {
								let list = [];
								for (let i = 1; i <= lastDateOfTheMonth; i++) {
									list.push(<Picker.Item label={`${i}`} value={i} />);
								}
								return list;
							})()}
						</Picker>
					</View>
					<View  style={{flexDirection:"row",height:"10%",width:"100%",justifyContent:"space-between",marginBottom:"3%",alignItems:"center"}}>
						<Text style={{fontSize:normalize(15)}}>{"週始まり曜日"}</Text>
						<Picker style={{
							width:"30%"
						}}
							selectedValue={firstDayOfTheWeek}
							onValueChange={(item) => {
								setFirstDayOfTheWeek(parseInt(item));
								AsyncStorage.setItem("firstDayOfTheWeek", `${item}`);
							}}
						>
							<Picker.Item label={"週始めの曜日"} value={"-1"} />
							{(() => {
								let list = [];
								const weeks = ["日", "月", "火", "水", "木", "金", "土"];
								for (let i = 0; i < 7; i++) {
									list.push(<Picker.Item label={`${weeks[i]}`} value={i} />);
								}
								return list;
							})()}
						</Picker>
					</View>
						<Button title={"テーブル削除"} onPress={()=>{
							if(deleteTableCount === 3){
								setDeleteTableCount(0);
								Db.deleteTable();
								setSnackbarText("テーブルを削除しました。");
								setSnackbarButtonText("OK");
								setVisible(true);
							}else{
								setDeleteTableCount(deleteTableCount+1);
								setSnackbarText(`あと${3-deleteTableCount}でテーブルを削除します。`);
								setSnackbarButtonText("CANCEL");
								setVisible(true);
							}
							}}/>
						<Button title={"テーブル作成"} onPress={()=>{Db.createTable()}}/>
						<Button title={"テーブル確認"} onPress={()=>{Db.select(()=>{},(balaList)=>{console.log(balaList)})}}/>
						<Button title={"DB2JSON"} onPress={()=>{
							console.log(JSON.stringify(balanceDataList,null,"\t"));
							Clipboard.setString(JSON.stringify(balanceDataList,undefined,"\t"));
						}}/>
						<Button title={"Json読込とDB更新"} onPress={()=>{
							Clipboard.getString()
							.then((data)=>{
								let newBalaData:BalanceData[] = JSON.parse(data);
								newBalaData.forEach((baladata)=>{
									Db.insertToDb(baladata);
								});
							})
						}} />
						<Text>{`New OTA update is ${isUpdateAvailable}`}</Text>
						<Snackbar
							visible={visible}
							onDismiss={() => { setVisible(false) }}
							action={{
								label: snackbarButtonText,
								onPress: ()=>{
									setDeleteTableCount(0);
									if(snackbarButtonText === "CANCEL"){
										setSnackbarText("カウントをリセットしました。");
										setSnackbarButtonText("OK");
									}else{
										setVisible(false);
									}
								}
							}}
							style={{width:"100%"}}
						>{snackbarText}</Snackbar>
				</View>
			</View>
		</View>
	);
}