
var AWS = require('aws-sdk')
var im = require('imagemagick')
var fs = require('fs')
var parseSQS = require('./parse-sqs.js')
var receiveMessage = require('./receive-message.js')
var getObject = require('./get-object.js')
var saveImage = require('./save-image.js')
var findFaces = require('./find-faces.js')
var calculateCenter = require('./calculate-center.js')
var findModLabels = require('./find-mod-labels.js')
var saveObject = require('./save-object.js')
var sendMessage = require('./send-message.js')

// AWS.config.loadFromPath('./aws.credentials.json')

var startingImage = '/tmp/img.jpg'
var cropOneImage = '/tmp/imgeCrop1.jpg'
var outputImage = '/tmp/output.jpg'
var thumbnailHeight = 300
var thumbnailWidth = 300
var sqs = new AWS.SQS({apiVersion: '2012-11-05'})
var s3 = new AWS.S3({apiVersion: '2006-03-01'})
var rekognition = new AWS.Rekognition()


module.exports = index

function index(callback) {
  receiveMessage(sqs, function (err, s3Params) {
    if (err) {
      console.log(err)
      callback(err)
      return
    }
    getObject(s3, s3Params, function (err, imageData) {
      if (err) {
        console.log(err)
        callback(err)
        return
      }
      saveImage(startingImage, imageData.Body, function () {
        im.identify(['-format', '%wx%h', startingImage], function(err, output) {
            if (err) {
              console.log(err)
              callback(err)
              return
            } 
            var dimensions = output.split('x')
            var width = dimensions[0]
            var height = dimensions[1]
            findModLabels(rekognition, imageData, function (err, data) {
              if (err) {
                console.log(err)
                callback(err)
                return
              }
              var modLabels = data
              findFaces(rekognition, imageData, function(err, faceData) {
                if (err) {
                  console.log(err)
                  callback(err)
                  return
                }
                var center = calculateCenter(faceData, width, height, function (err, center) {
                  if (err) {
                    console.log(err)
                    callback(err)
                    return
                  }
                  var largestBoundingBox = {
                    width: center.column*2,
                    height: center.row*2
                  }
                  if (largestBoundingBox.width > width) {
                    largestBoundingBox.width = width
                  } else {
                    width = largestBoundingBox.width
                  }
                  if (largestBoundingBox.height  > height) {
                    largestBoundingBox.height = height
                  } else {
                    height = largestBoundingBox.height
                  }
                  im.crop({
                    srcPath: startingImage,
                    dstPath: cropOneImage,
                    height: height,
                    width: width,
                    gravity: 'NorthWest',
                    quality: 1
                  }, function (err, stdout, stderr) {
                    if (err) {
                      console.log(err)
                      callback(err)
                      return
                    } 
                    im.crop({
                      srcPath: cropOneImage,
                      dstPath: outputImage,
                      height: thumbnailHeight,
                      width: thumbnailWidth,
                      gravity: 'Center', 
                      quality: 1
                    }, function(err, stdout, stderr) {
                      if(err) {
                        console.log(err)
                        callback(err)
                        return
                      }
                      var cropData = fs.createReadStream(outputImage)
                      saveObject(s3, cropData, outputImage, function(err, data) {
                        if (err) {
                          console.log(err)
                          callback(err)
                          return
                        }
                        var s3Url = 'https://s3.amazonaws.com/image-processor-moderator/output' + outputImage
                        sendMessage(sqs, modLabels, s3Url, function (err, data) {
                          if (err) {
                            console.log(err)
                            callback(err)
                            return
                          }
                          console.log(data)
                          callback(null, data)
                          return
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
}

