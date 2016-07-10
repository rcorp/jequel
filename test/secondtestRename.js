require('coffee-script/register')
var treeRename = require ("../src/treeRename.coffee");
data = {addresses: 'sector-19', landmark: 'near bsnl', pincode: "pincode", country: "country"};
renameMap = {addresses: 'address', landmark: 'landmark', pincode: "pincode", country: "country"};
var a = treeRename(data,renameMap);
console.log("zasm", a);
