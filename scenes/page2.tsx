import React, { useState } from "react";
import { View, Text } from "react-native";
import { Picker } from '@react-native-community/picker'
import { Button, Header, Input } from "react-native-elements";
import BalanceData from "../BalanceData";
import { Snackbar } from 'react-native-paper';
import { deleteById, insertToDb, select, update } from "../DatabaseOperation";
import { useFocusEffect } from '@react-navigation/native';
import { NavigationScreenProp, NavigationState, NavigationParams } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';
import Icons from 'react-native-vector-icons/MaterialIcons';


interface IProps {
	navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export default function page2(props: IProps) {
	const [dateText, setDateText] = useState(`${new Date().getMonth()+1}/${new Date().getDate()}`);
	const [kindText, setKindText] = useState<"収入"|"支出">("支出");
	const [contentText, setContentText] = useState("");
	const [priceText, setPriceText] = useState("");
	const [visible, setVisible] = useState(false);
	const [currentId, setCurrentId] = useState(-1);
	const [balanceDataList, setBalanceDataList] = useState<BalanceData[]>([]);
	const [mode,setMode] = useState<"add"|"edit">("add");
	const [mainKey,setMainKey] = useState(-1);
	useFocusEffect(
		React.useCallback(() => {
			AsyncStorage.getItem("currentItemId", (error,result) => { console.log(error);console.log(result) })
				.then((Id) => {
					if (Id !== null) {
						setMode("edit");
						setCurrentId(parseInt(Id));
						select(setBalanceDataList, (list) => {
							if (list.length > 1) {
								setMainKey(list[1].id);
								setDateText(list[1].date);
								if (list[1].kind === "支出" || list[1].kind === "収入") setKindText(list[1].kind);
								setContentText(list[1].content);
								setPriceText(list[1].price);
								setCurrentId(list[1].id);
							}
						}, `id=${Id}`);
					}else{
						setMode("add");
						setDateText(`${new Date().getMonth()+1}/${new Date().getDate()}`);
						setKindText("支出");
						setContentText("");
						setPriceText("");
					}
				});
			AsyncStorage.removeItem("currentItemId");
		}, [])
	);
	return (
		<View style={{width:"100%",height:"85%"}}>
			<Header
					leftComponent={{ icon: "menu" }}
					centerComponent={{ text: "お貧乏様", style: { fontSize: 20 } }}
					rightComponent={{icon:"delete-forever",onPress:()=>{
						deleteById(()=>{},`id=${currentId}`);
						props.navigation.navigate("HOME");
					}}}
				/>
			<View style={{ alignItems: "center", justifyContent: "center", height: "100%", padding: "1%" }}>
				<View style={{ height: "100%", width: "100%", padding: "10%" }}>
					<Input placeholder={"日付"} containerStyle={{ marginBottom: "10%" }} value={dateText} onChangeText={(event) => { setDateText(event) }} />
					<Picker style={{
						marginBottom: "10%",
						height: "6%",
					}}
						selectedValue={kindText}
						onValueChange={(item, index) => {
							const tItem = item.toString();
							if(tItem === "支出" || tItem === "収入") setKindText(tItem);
						}}
					>
						<Picker.Item label={"支出"} value={"支出"} />
						<Picker.Item label={"収入"} value={"収入"} />
					</Picker>
					<Input placeholder={"事柄"} containerStyle={{ marginBottom: "10%" }} value={contentText} onChangeText={(event) => { setContentText(event) }} />
					<Input placeholder={"金額"} containerStyle={{ marginBottom: "10%" }} value={priceText} onChangeText={(event) => { setPriceText(`${event}`) }} />
					<Button title={"登録"} onPress={() => {
						setVisible(true);
						console.log(mode);
						console.log(mainKey);
						if(mode === "add"){
							insertToDb(new BalanceData(dateText, kindText, contentText, priceText));
						}else{
							update(new BalanceData(dateText, kindText, contentText, priceText,mainKey));
						}
					}} />
				</View>
				<Snackbar
					visible={visible}
					onDismiss={() => { setVisible(false) }}
					action={{
						label: "OK",
						onPress: () => {
							setVisible(false);
							props.navigation.navigate("HOME");
						}
					}}
				>{"登録しました。"}</Snackbar>
			</View>
		</View>
	);
}