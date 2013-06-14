/* 依赖于fish 待完善，该算法也比较烂。。。*/
function birthDataFn(val) {
    val = fish.trim(val);
    var yearMaxLength = 4,
        monthMaxLength = 2,
        dayMaxLength = 2,
        splitArr = val.split("-"),
        birthData = fish.parseDate(val),
        year = birthData.getFullYear(),
        month = birthData.getMonth() + 1,
        day = birthData.getDate(),
        dateArr = val.split("-"),
        year2 = parseInt(dateArr[0], 10),
        month2 = parseInt(dateArr[1], 10),
        day2 = parseInt(dateArr[2], 10);
    //控制年月日的长度
    if(splitArr[0]==undefined || splitArr[1]==undefined || splitArr[2]==undefined){
        return false;
    }
    if(splitArr[0].length>yearMaxLength||splitArr[1].length>monthMaxLength||splitArr[2].length>dayMaxLength){
        return false;
    }
    if (isNaN(year2) || isNaN(month2) || isNaN(day2)) {
        return false;
    }
    if (year == year2 && month == month2 && day == day2) {
        return true;
    }
    else {
        return false;
    }
};