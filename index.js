
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


var sqs = new AWS.SQS({apiVersion: '2012-11-05'})
var s3 = new AWS.S3({apiVersion: '2006-03-01'})
var rekognition = new AWS.Rekognition()


module.exports = index

function index(callback) {
  receiveMessage(sqs, function (err, s3Params) {
    if (err) {
      console.log(err)
    }

    getObject(s3, s3Params, function (err, imageData) {
      if (err) {
        console.log(err)
        callback(err)
      }
      saveImage('/tmp/image.jpg', imageData.Body, function () {
        im.identify(['-format', '%wx%h', '/tmp/image.jpg'], function(err, output) {
            if (err) {
              console.log(err)
              callback(err)
            } 
            var dimensions = output.split('x')
            var width = dimensions[0]
            var height = dimensions[1]
            findModLabels(rekognition, imageData, function (err, data) {
              if (err) {
                console.log(err)
              }
              var modLabels = data
              findFaces(rekognition, imageData, function(err, faceData) {
                if (err) {
                  console.log(err)
                  callback(err)
                }
                var center = calculateCenter(faceData, width, height)
                console.log(center)
                // recenter image - TODO
                var fileName = '/tmp/img300crop.jpg'
                im.crop({
                  srcPath: '/tmp/image.jpg',
                  dstPath: fileName,
                  height: 300,
                  width: 300,
                  gravity: 'Center'
                }, function(err, stdout, stderr) {
                  if(err) {
                    console.log(err)
                    callback(err)
                  }
                  var cropData = fs.createReadStream(fileName)
                  saveObject(s3, cropData, fileName, function(err, data) {
                    if (err) {
                      console.log(err)
                      callback(err)
                    }
                    console.log('image was saved in s3')
                    var s3Url = 'https://s3.amazonaws.com/image-processor-moderator/output/img300crop.jpg'
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

}

