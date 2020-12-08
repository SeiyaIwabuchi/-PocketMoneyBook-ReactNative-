import React, { useState } from "react";
import { View, Picker, Text } from "react-native";
import { Header, normalize } from "react-native-elements";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-community/async-storage";
import { RFValue } from "react-native-responsive-fontsize";

export default function page3() {
	const [firstDateOfTheMonth, setFirstDateOfTheMonth] = useState(0);
	const [firstDayOfTheWeek, setFirstDayOfTheWeek] = useState(0);
	const date = new Date();
	const lastDateOfTheMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
							<Picker.Item label={"月初めの日"} value={"0"} />
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
				</View>
			</View>
		</View>
	);
}