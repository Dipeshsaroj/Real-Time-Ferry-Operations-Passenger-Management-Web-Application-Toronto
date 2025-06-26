//Primitive
 // 7 types : String, Number, Boolearn, null, undefined, Symbol,
//BigInt
// const score = 100
// const scoreValue = 100.3
// const isLoggedIn = false
// const outsideTemp = null
// let userEmail;
// //non primittive datatype is function
// const heros = ["shaktiman", "naagraj", "doga"]; //datatype-object
// let myObj = {
// name: "hitesh", age: 22,
// }
// const myFunction = function (){
//      console. log("hello world");//datatype-function(object function)
// }
// console.log(typeof(heros));
// https://262.ecma-international.org/5.1/#sec-11.4.3. for read datatypes

//+++++++++++++++++++++++++++

//two memory heap and stack where stack makes copy and heap directly pass by reference
let myYoutubename = "hiteshchoudharydotcom"
let anothername = myYoutubename
anothername = "chaiaurcode"
console. log (myYoutubename) ; 
console. log (anothername) ;
let userOne = {
     email: "user@google.com", 
     upi: "user@ybl"
}
let userTwo = userOne
userTwo.email = "hitesh@google.com"
console.log(userOne)
console.log(userTwo)