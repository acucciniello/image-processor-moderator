module.exports = saveObject

function saveObject(s3, fileData, fileName, callback) {
  var s3Params = {
    Bucket: 'image-processor-moderator',
    Key: 'output/' + fileName, 
    Body: fileData
  }
  s3.putObject(s3Params, function(err, data) {
    if (err) {
      callback(err)
      return
    }
    callback(null, data)
  })
}