import React from  'react'
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
  
export default function normalize(size:number,textLength?:number) {
    if(textLength === undefined) return RFValue(size-5);
    else{
        return RFValue(size - ((textLength-2)**2));
    }
}