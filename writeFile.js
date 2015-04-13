#!/usr/bin/node --enable-ssl3

var fs = require('fs');
var faker = require('./faker.js');
var ssn = require('ssn');

var ssnArray = [];
for (var i = 0; i < 10000; i++) {
  var uniqueSSN = ssn.generate();
  if (ssnArray.indexOf(uniqueSSN) == -1) {
    ssnArray.push(uniqueSSN);
    console.log(i + " " + uniqueSSN);
    var randomName = faker.name.findName();
    var insertData = randomName + "|" + uniqueSSN + "\n";
    console.log(insertData);
    fs.appendFile('data/users.db', insertData, function(err) {
    });
  }
}


