require('coffee-script/register')
var treeRename = require ("../src/treeRename.coffee");
data = {address: 'sector-19', landmark: 'near bsnl', pincode: "pincode", country: "country"};
renameMap = {address: 'address', landmark: 'landmark', pincode: "pincode", country: "country"};
var a = treeRename(data,renameMap);
console.log("zasm", a);
