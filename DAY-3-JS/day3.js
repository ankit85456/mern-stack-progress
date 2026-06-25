// ==========================
// var, let, const Full Concept
// ==========================

// ---------- var ----------
var name = "Ankit";
console.log("Name :", name);

name = "Rahul";
console.log("Updated Name :", name);

var name = "Aman";
console.log("Redeclared Name :", name);


// ---------- let ----------
let age = 21;
console.log("Age :", age);

age = 22;
console.log("Updated Age :", age);

// let age = 25; // Error


// ---------- const ----------
const country = "India";
console.log("Country :", country);

// country = "USA"; // Error


// ---------- Block Scope ----------
{
    var x = 100;
    let y = 200;
    const z = 300;

    console.log("Inside Block");
    console.log(x);
    console.log(y);
    console.log(z);
}

console.log("Outside Block");
console.log(x);
// console.log(y); // Error
// console.log(z); // Error


// ---------- Function Scope ----------
function demo() {

    var a = 10;
    let b = 20;
    const c = 30;

    console.log(a);
    console.log(b);
    console.log(c);
}

demo();


// ---------- Hoisting ----------
console.log(test1);
var test1 = 50;

// console.log(test2);
// let test2 = 60;

// console.log(test3);
// const test3 = 70;


// ---------- Reassignment ----------
var city = "Patna";
city = "Delhi";
console.log(city);

let state = "Bihar";
state = "Punjab";
console.log(state);

const pin = 800001;
// pin = 800002; // Error


// ---------- Redeclaration ----------
var course = "Java";
var course = "JavaScript";
console.log(course);

// let course = "Python"; // Error
// const course = "C++"; // Error


// ---------- Objects ----------
const student = {
    name: "Ankit",
    age: 21,
    city: "Patna"
};

console.log(student);

student.age = 22;
student.city = "Noida";
student.branch = "CSE";

console.log(student);


// ---------- Arrays ----------
const marks = [80, 85, 90];

console.log(marks);

marks.push(95);
marks.push(100);

console.log(marks);

// marks = [10,20]; // Error


// ---------- if Block ----------
let number = 15;

if(number > 10){

    var message1 = "Greater";
    let message2 = "Inside Let";
    const message3 = "Inside Const";

    console.log(message1);
    console.log(message2);
    console.log(message3);
}

console.log(message1);
// console.log(message2); // Error
// console.log(message3); // Error


// ---------- for Loop ----------
for(let i=1;i<=5;i++){
    console.log("let Loop :", i);
}

for(var j=1;j<=5;j++){
    console.log("var Loop :", j);
}

console.log("Outside Loop :", j);


// ---------- Shadowing ----------
let value = 10;

{
    let value = 20;
    console.log("Inside :", value);
}

console.log("Outside :", value);


// ---------- Template Literals ----------
let firstName = "Ankit";
let college = "LPU";

console.log(`My name is ${firstName}`);
console.log(`I study at ${college}`);


// ---------- Arithmetic ----------
let a = 20;
let b = 10;

console.log(a + b);
console.log(a - b);
console.log(a * b);
console.log(a / b);
console.log(a % b);


// ---------- Comparison ----------
console.log(a > b);
console.log(a < b);
console.log(a == b);
console.log(a != b);


// ---------- Logical ----------
let isStudent = true;
let isAdult = true;

console.log(isStudent && isAdult);
console.log(isStudent || false);
console.log(!isStudent);


// ---------- Final Summary ----------
console.log("========== SUMMARY ==========");

var language = "JavaScript";
let version = "ES6";
const creator = "Brendan Eich";

console.log(language);
console.log(version);
console.log(creator);

language = "TypeScript";
version = "ES2022";

console.log(language);
console.log(version);

// creator = "Someone"; // Error

console.log("Program Finished Successfully");