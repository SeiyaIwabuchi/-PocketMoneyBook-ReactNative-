import React, { useState } from "react";
import { View,Text } from "react-native";
import {Picker} from '@react-native-community/picker'
import { Button, Input } from "react-native-elements";
import list from '../Datalist';
import BalanceData from "../BalanceData";
import { Snackbar } from 'react-native-paper';
interface IProps{
    navigation:any;
}

export default function page2(props:IProps){
    const [dateText,setDateText] = useState("");
    const [kindText,setKindText] = useState("out");
    const [contentText,setContentText] = useState("");
    const [priceText,setPriceText] = useState("");
    const [visible, setVisible] = React.useState(false);
    return(
        <View style={{alignItems:"center",justifyContent:"center",height:"100%",padding:"1%"}}>
            <View style={{height:"100%",width:"100%",padding:"10%"}}>
                <Input placeholder={"日付"} containerStyle={{marginBottom:"10%"}} value={dateText} onChangeText={(event)=>{setDateText(event)}}/>
                <Picker style={{
                    marginBottom:"10%",
                    height:"6%",
                    }}
                    selectedValue={kindText}
                    onValueChange={(item,index)=>{
                        setKindText(item.toString());
                    }}
                    >
                    <Picker.Item label={"支出"} value={"out"}/>
                    <Picker.Item label={"収入"} value={"in"}/>
                </Picker>
                <Input placeholder={"事柄"} containerStyle={{marginBottom:"10%"}} value={contentText} onChangeText={(event)=>{setContentText(event)}}/>
                <Input placeholder={"金額"} containerStyle={{marginBottom:"10%"}} value={priceText} onChangeText={(event)=>{setPriceText(event)}}/>
                <Button title={"登録"} onPress={()=>{
                    list.push(new BalanceData(dateText,kindText==="out"?"支出":"収入",contentText,priceText));
                    setVisible(true);
                }}/>
            </View>
            <Snackbar
            visible={visible}
            onDismiss={()=>{setVisible(false)}}
            action={{
                label:"OK",
                onPress:()=>{
                    setVisible(false);
                    props.navigation.navigate("HOME");
                }
            }}
            >{"登録しました。"}</Snackbar>
        </View>
    );
}