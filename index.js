#! /usr/bin/env node
var fs = require('fs')
var esprima = require('esprima');

// Check the input file
// usage would be node index.js theFile.js 
// later to be folder
if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

var filename = process.argv[2];
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) throw err;
  // at the moment, hashbang should be removed from the first line
  // of the data file
  var parsed = esprima.parse(data.toString());
  // console.log(JSON.stringify(esprima.parse(data.toString()), null, 2));
  // at this point we should loop through parsed.body and look for all "FunctionDeclaration" 
  // types, to get a list of the functions and their names & params
  for(var element in parsed.body){
    var type = parsed.body[element].type;
    if(type === "FunctionDeclaration"){
      var name = parsed.body[element].id['name'];
      console.log(type + " " + name)      
    } else {
      // it is not a function, but something else
      console.log(parsed.body[element]);
    }

  }
});
