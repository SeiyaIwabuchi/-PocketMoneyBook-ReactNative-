import React, { useState } from "react";
import { View } from "react-native";
import { Picker } from '@react-native-community/picker'
import { Button, Header, Input } from "react-native-elements";
import BalanceData from "../BalanceData";
import { Snackbar } from 'react-native-paper';
import { deleteById, getMaxId, insertToDb, select, update } from "../DatabaseOperation";
import { useFocusEffect } from '@react-navigation/native';
import { NavigationScreenProp, NavigationState, NavigationParams } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';
import { validation, ValidationResult } from "../Validator";
import DatePicker from 'react-native-datepicker';


interface IProps {
	navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export default function page2(props: IProps) {
	const [dateText, setDateText] = useState(`${new Date().getMonth()+1}/${new Date().getDate()}`);
	const [date,setDate] = useState(new Date());
	const [kindText, setKindText] = useState<"収入"|"支出">("支出");
	const [contentText, setContentText] = useState("");
	const [priceText, setPriceText] = useState("");
	const [visible, setVisible] = useState(false);
	const [currentId, setCurrentId] = useState(-1);
	const [, setBalanceDataList] = useState<BalanceData[]>([]);
	const [mode,setMode] = useState<"add"|"edit">("add");
	const [mainKey,setMainKey] = useState(-1);
	const [snackbarText,setSnackbarText] = useState<string>();
	const [valiResult,setValiResult] = useState<ValidationResult>();
	const [maxId,setMaxId] = useState(-1);
	useFocusEffect(
		React.useCallback(() => {
			AsyncStorage.getItem("currentItemId", (error,result) => { console.log(error);console.log(result) })
				.then((Id) => {
					if (Id !== null) {
						setMode("edit");
						setCurrentId(parseInt(Id));
						select(setBalanceDataList, (list) => {
							if (list.length > 0) {
								setMainKey(list[0].id);
								setDateText(list[0].date);
								if (list[0].kind === "支出" || list[0].kind === "収入") setKindText(list[0].kind);
								setContentText(list[0].content);
								setPriceText(list[0].price);
								setCurrentId(list[0].id);
							}
						}, `id=${Id}`);
					}else{
						setMode("add");
						setDateText(`${new Date().getMonth()+1}/${new Date().getDate()}`);
						setKindText("支出");
						setContentText("");
						setPriceText("");
						getMaxId((res)=>{
							setMaxId(res.maxId);
						});
					}
				});
			AsyncStorage.removeItem("currentItemId");
		}, [])
	);
	return (
		<View style={{width:"100%",height:"85%"}}>
			<Header
					placement={"left"}
					centerComponent={{ text: "お貧乏様", style: { fontSize: 25 } }}
                	containerStyle={{shadowOpacity:1,shadowRadius:0,shadowOffset:{width:0,height:1},shadowColor:"#ccc",elevation:2}}
					rightComponent={{icon:"delete-forever",onPress:()=>{
						deleteById(()=>{},`id=${currentId}`);
						props.navigation.navigate("HOME");
					}}}
				/>
			<View style={{ alignItems: "center", justifyContent: "center", height: "100%", padding: "1%" }}>
				<View style={{ height: "100%", width: "100%", padding: "10%" }}>
					<DatePicker 
						style={{ marginBottom: "10%",width:"97%" ,marginLeft:"3%"}} 
						mode="date"
						date={date}
						format="YYYY/MM/DD"
						confirmBtnText="Confirm"
						cancelBtnText="Cancel"
						onDateChange={(tdate)=>{
							setDate(new Date(tdate));
						}}
						customStyles={
							{
								dateInput:{alignItems:"flex-start"},
								dateText:{paddingLeft:"3%"}
							}
						}
					/>
					<Picker style={{
						marginBottom: "10%",
						height: "6%",
					}}
						selectedValue={kindText}
						onValueChange={(item) => {
							const tItem = item.toString();
							if(tItem === "支出" || tItem === "収入") setKindText(tItem);
						}}
					>
						<Picker.Item label={"支出"} value={"支出"} />
						<Picker.Item label={"収入"} value={"収入"} />
					</Picker>
					<Input placeholder={"事柄"} containerStyle={{ marginBottom: "10%" }} value={contentText} onChangeText={(event) => { setContentText(event) }} />
					<Input placeholder={"金額"} containerStyle={{ marginBottom: "10%" }} value={priceText} onChangeText={(event) => { setPriceText(`${event}`) }} />
					<Button title={"登録"} onPress={() => { //登録ボタン押下
						setVisible(false);
						let data:BalanceData;
						let tValiResult:ValidationResult;
						if(mode === "add"){
							data = new BalanceData(`${date.getMonth()}/${date.getDate()}`, kindText, contentText, priceText,maxId+1);
							tValiResult = validation(data);
							if (tValiResult.isResult){
								insertToDb(data);
								setSnackbarText("登録しました。");
								getMaxId((res)=>{
									setMaxId(res.maxId);
								});
							}else{
								setSnackbarText(tValiResult.errorText);
							}
						}else{
							data = new BalanceData(`${date.getMonth()}/${date.getDate()}`, kindText, contentText, priceText,mainKey);
							tValiResult = validation(data);
							if(tValiResult.isResult){
								update(data);
								setSnackbarText("登録しました。");
								getMaxId((res)=>{
									setMaxId(res.maxId);
								});
							}else{
								setSnackbarText(tValiResult.errorText);
							}
						}
						setValiResult(tValiResult);
						setVisible(true);
					}} />
				</View>
				<Snackbar
					visible={visible}
					onDismiss={() => { setVisible(false) }}
					action={{
						label: "OK",
						onPress: ()=>{
							if(valiResult?.isResult){
								setVisible(false);
								props.navigation.navigate("HOME");
							}else{
								setVisible(false);
							}
						}
					}}
				>{snackbarText}</Snackbar>
			</View>
		</View>
	);
}