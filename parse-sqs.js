module.exports = parseSQS

function parseSQS(s3link) {
  var startBucket = 25
  var bucket = s3link.substr(startBucket, startBucket)
  var key = s3link.substr(startBucket * 2 + 1, s3link.length - 1)

  var s3parameters = {
    Bucket: bucket,
    Key: key
  }

  return s3parameters
}