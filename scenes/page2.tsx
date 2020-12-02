import React, { useState } from "react";
import { View,Text } from "react-native";
import {Picker} from '@react-native-community/picker'
import { Button, Input } from "react-native-elements";
import BalanceData from "../BalanceData";
import { Snackbar } from 'react-native-paper';
import {insertToDb, select} from "../DatabaseOperation";
import { useFocusEffect } from '@react-navigation/native' ;
import { NavigationScreenProp, NavigationState, NavigationParams } from "react-navigation";
import AsyncStorage from '@react-native-community/async-storage';


interface IProps{
    navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

export default function page2(props:IProps){
    const [dateText,setDateText] = useState(`${new Date().getMonth()}/${new Date().getDate()}`);
    const [kindText,setKindText] = useState("支出");
    const [contentText,setContentText] = useState("");
    const [priceText,setPriceText] = useState("");
    const [visible, setVisible] = useState(false);
    const [currentId,setCurrentId] = useState(-1);
    const [balanceDataList,setBalanceDataList] = useState<BalanceData[]>([]);
    useFocusEffect(
        React.useCallback(()=>{
            AsyncStorage.getItem("currentItemId",(error)=>{console.log(error)})
            .then((Id)=>{
                if(Id !== null){
                    setCurrentId(parseInt(Id));
                    select(setBalanceDataList,(list)=>{},`id=${Id}`);
                }
            })
        },[])
    );
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
                    <Picker.Item label={"支出"} value={"支出"}/>
                    <Picker.Item label={"収入"} value={"収入"}/>
                </Picker>
                <Input placeholder={"事柄"} containerStyle={{marginBottom:"10%"}} value={contentText} onChangeText={(event)=>{setContentText(event)}}/>
                <Input placeholder={"金額"} containerStyle={{marginBottom:"10%"}} value={priceText} onChangeText={(event)=>{setPriceText(`${event}`)}}/>
                <Button title={"登録"} onPress={()=>{
                    setVisible(true);
                    insertToDb(new BalanceData(dateText,kindText,contentText,priceText));
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