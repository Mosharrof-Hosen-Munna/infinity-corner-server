function convertNumber(number){
    const numberLength = number.toString().length

    if(numberLength < 7){
        return `${(number / 1000).toFixed(1)}K`
    }else if(numberLength < 10){
        return `${(number / 1000000).toFixed(2)}M`
    }else if(numberLength < 13){
        return `${(number / 1000000000).toFixed(1)}B`
    }else{
        return  `${(number / 1000000000000).toFixed(1)}T`
    }
}


console.log(convertNumber(52646))