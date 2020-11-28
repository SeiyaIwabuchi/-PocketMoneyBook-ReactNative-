import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pages1 from './scenes/page1';
import Pages2 from './scenes/page2';
import Pages3 from './scenes/page3';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native';
import Icons from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const PageIcons = [
  {
    pageName:"Page1",
    iconName:"home",
    component:Pages1
  },
  {
    pageName:"Page2",
    iconName:"menu",
    component:Pages2
  },
  {
    pageName:"Page3",
    iconName:"settings",
    component:Pages3
  },
];
export default function App() {
  let tabList:JSX.Element[] = [];
  PageIcons.forEach((pageicon)=>{
    tabList.push(<Tab.Screen name={pageicon.pageName} component={pageicon.component}/>);
  });
  return (
    <View style={{height:"99%"}}>
      <NavigationContainer>
        <Tab.Navigator initialRouteName={"Page1"} screenOptions={
          ({route}) => ({
            tabBarIcon:({focused,color,size}) => {
              let iconName = "";
              PageIcons.forEach((pageicon)=>{
                if(route.name === pageicon.pageName){
                  iconName = pageicon.iconName;
                }
              });
              
              return <Icons name={iconName} size={size} color={color}/>
            }
          })
        }>
          {tabList}
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
