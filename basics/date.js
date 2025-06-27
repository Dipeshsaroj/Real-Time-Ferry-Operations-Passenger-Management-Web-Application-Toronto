//DATES
let myDate= new Date();
// console.log(myDate);
// console.log(myDate.toString());
// console.log(myDate.toDateString());
// console.log(myDate.toISOString());
// console.log(myDate.toJSON());
// console.log(myDate.toLocaleDateString());
// console.log(myDate.toLocaleString());
// console.log(myDate.toLocaleTimeString());
// console.log(myDate.toTimeString());
// console.log(myDate.toUTCString());
// console.log(typeof myDate);
let myCreatedDate=new Date(2025,2,4);
// console.log(mycreatedate);
// console.log(mycreatedate.toDateString());
// console.log(mycreatedate.toLocaleString());
// let my = new Date("01-14-2023")
// console.log(my.toLocaleString());
let myTimeStamp = Date.now()
console. log (myTimeStamp) ;
console. log (myCreatedDate. getTime ());
console. log (myCreatedDate.getTime());
console. log(Math.floor(Date.now()/1000));
let newDate = new Date()
console. log (newDate);
console. log (newDate.getMonth() + 1); 
console. log (newDate.getDay());
newDate.toLocaleString('default',{
    weekday:"long",
    
})