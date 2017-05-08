var fs = require('fs')

module.exports = SaveImage

function SaveImage(filename, data, callback){
  var myBuffer = new Buffer(data.length);
  for (var i = 0; i < data.length; i++) {
      myBuffer[i] = data[i]
  }
  console.log('About to save the file' + filename)
  fs.writeFile(filename, myBuffer, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
          callback()
      }
  })
}