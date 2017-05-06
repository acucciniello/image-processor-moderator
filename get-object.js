module.exports = GetObject

function GetObject (s3, s3Params, callback) {
  s3.getObject(s3Params, function (err, data) {
      if(err) {
        console.log(err)
        callback(err)
      }
      callback(null, data)
  })
}