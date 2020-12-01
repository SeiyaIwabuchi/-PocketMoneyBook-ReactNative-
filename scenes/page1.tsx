import { View, Text, FlatList, PixelRatio, Dimensions, Platform, ImageBackground } from "react-native";
import React, { useEffect, useState } from 'react';
import { Avatar, ListItem } from "react-native-elements";
import normalize from '../normalize';
import * as SQLite from 'expo-sqlite';
import BalanceData from '../BalanceData'
import IBalanceData from "../IBalanceData";
import list from "../Datalist";
import DatabaseConfig from '../DatabaseConfig';

function select(setDataHandle: (t: typeof DatabaseConfig.model) => void) {
    type model = typeof DatabaseConfig.model;
    const db = SQLite.openDatabase(DatabaseConfig.databaseName);
    let tData: model;
    db.transaction((tx) => {
        tx.executeSql(
            "select * from " + DatabaseConfig.tableName,
            undefined,
            (_, { rows: SQLResultSetRowList }) => {
                for (let i = 0; i < SQLResultSetRowList.length; i++) {
                    tData = SQLResultSetRowList.item(i);
                }
            }
        );
    },
        (error) => { console.log(error) },
        () => {
            console.log("get success");
            console.log(tData);
            setDataHandle(tData);
        }
    );
}

interface IProps {
    navigation: any;
}

export default function page1(props: IProps) {
    const [text, setText] = useState("");
    const [balanceData,setBalanceData] = useState<typeof DatabaseConfig.model>();
    const renderItem = ({ item }: { item: IBalanceData }) => (
        <ListItem bottomDivider>
            <ListItem.Content style={{ flexDirection: "row" }}>
                <Text style={{ textAlign: "center", width: "25%", fontSize: 20 }}>{item.date}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: 20 }}>{item.kind}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: 20 }}>{item.content}</Text>
                <Text style={{ textAlign: "center", width: "25%", fontSize: 20 }}>{item.price}</Text>
            </ListItem.Content>
        </ListItem>
    );
    const keyExtractor = (item: IBalanceData, index: number) => index.toString()
    useEffect(() => {
        select(setBalanceData);
    }, []);
    return (
        <View style={{ height: "100%" }}>{/* ページコンテナ */}
            <View style={{ alignItems: "center", justifyContent: "center", height: "45%" }}>{/* 金額表示コンテナ */}
                <View style={{ alignItems: "center", justifyContent: "center", height: "60%", width: "100%" }}>{/* 今日表示コンテナ */}
                    <View style={{ alignItems: "center", justifyContent: "flex-end", height: "30%", width: "100%" }}>
                        <Text style={{ fontSize: normalize(40) }}>{"今日"}</Text>
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center", height: "70%", width: "100%" }}>
                        <Text style={{ fontSize: normalize(100) }}>{"500 円"}</Text>
                    </View>
                </View>
                <View style={{ alignItems: "center", justifyContent: "center", height: "40%", width: "100%", flexDirection: "row" }}>{/*今月今週コンテナ */}
                    <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "50%" }}>{/* 今週コンテナ */}
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "30%" }}>
                            <Text style={{ fontSize: normalize(30) }}>{"今週"}</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "70%" }}>
                            <Text style={{ fontSize: normalize(60) }}>{"3,500円"}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "50%" }}>{/* 今週コンテナ */}
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "30%" }}>
                            <Text style={{ fontSize: normalize(30) }}>{"今月"}</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "70%" }}>
                            <Text style={{ fontSize: normalize(60) }}>{"15,500円"}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", height: "55%" }}>{/* リストコンテナ */}
                <FlatList keyExtractor={keyExtractor} data={list} renderItem={renderItem} style={{ width: "100%" }} />
            </View>
        </View>
    );
}