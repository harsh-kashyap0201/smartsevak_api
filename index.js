const express=require('express');
const app=express();
const availability=require('./availability.json');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/doctor-availability',(req,res)=>{
    let {date,time}=req.query;
    //date format:yyyy-mm-dd
    //time format:hh:mm
    let day=new Date(date).getDay();
    let dayNameArray=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    let dayName=dayNameArray[day];
    let dayAvailablity=availability.availabilityTimings[dayName];
    //check if slot available
    let isAvailable=dayAvailablity.some((item)=>{
        let startTime=item.start.split(':');
        let endTime=item.end.split(':');
        let startTimeInMinutes=parseInt(startTime[0])*60+parseInt(startTime[1]);
        let endTimeInMinutes=parseInt(endTime[0])*60+parseInt(endTime[1]);
        let timeInMinutes=parseInt(time.split(':')[0])*60+parseInt(time.split(':')[1]);
        return timeInMinutes>=startTimeInMinutes && timeInMinutes<=endTimeInMinutes;
    });
    if(isAvailable){
        res.send({isAvailable:true});
    }
    else{
        //finding next available slot
        let nextAvailableDate=date;
        let nextAvailableTime=time;
        let nextAvailableDayName=dayNameArray[day];
        let isNextAvailable=false;
        while(!isNextAvailable){
            let nextDayAvailablity=availability.availabilityTimings[nextAvailableDayName];
            let isAvailable=nextDayAvailablity.some((item)=>{
            let startTime=item.start.split(':');
                let startTimeInMinutes=parseInt(startTime[0])*60+parseInt(startTime[1]);
                let timeInMinutes=parseInt(time.split(':')[0])*60+parseInt(time.split(':')[1]);
                nextAvailableDate=date;
                nextAvailableTime=item.start;
                return startTimeInMinutes>=timeInMinutes;
            });
            if(isAvailable){
                isNextAvailable=true;
            }
            
            
            nextAvailableDayName=dayNameArray[(day+1)%7];
            nextAvailableDate=new Date(date);
            nextAvailableDate.setDate(nextAvailableDate.getDate()+1);
            //checking if day is sunday-> no slots-> increase day
            if(nextAvailableDayName=='sunday'){
                nextAvailableDate.setDate(nextAvailableDate.getDate()+1);
            }
            nextAvailableDate=nextAvailableDate.toISOString().split('T')[0];
            nextAvailableTime=availability.availabilityTimings[nextAvailableDayName][0].start;
            break;
        }
        res.send({"isAvailable":false,
            "nextAvailableSlot":{
                "date":nextAvailableDate,
                "time":nextAvailableTime,
            }
        });
    }
});
app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});