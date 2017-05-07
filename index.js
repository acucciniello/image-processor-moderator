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

AWS.config.loadFromPath('./aws.credentials.json')


var sqs = new AWS.SQS({apiVersion: '2012-11-05'})
var s3 = new AWS.S3({apiVersion: '2006-03-01'})
var rekognition = new AWS.Rekognition()


receiveMessage(sqs, function (err, s3Params) {
  if (err) {
    console.log(err)
  }

  getObject(s3, s3Params, function (err, imageData) {
    if (err) {
      console.log(err)
    }
    saveImage('image.jpg', imageData.Body, function () {
      im.identify(['-format', '%wx%h', 'image.jpg'], function(err, output) {
          if (err) {
            console.log(err)
          } 
          var dimensions = output.split('x')
          var width = dimensions[0]
          var height = dimensions[1]
          var modLabels = findModLabels(rekognition, imageData)
          console.log(modLabels)
          findFaces(rekognition, imageData, function(err, faceData) {
            if (err) {
              console.log(err)
            }
            var center = calculateCenter(faceData, width, height)
            console.log(center)
            // recenter image - TODO
            var fileName = 'img300crop.jpg'
            im.crop({
              srcPath: 'image.jpg',
              dstPath: fileName,
              height: 300,
              width: 300,
              gravity: 'Center'
            }, function(err, stdout, stderr) {
              if(err) {
                console.log(err)
              }
              var cropData = fs.createReadStream(fileName)
              saveObject(s3, cropData, fileName, function(err, data) {
                if (err) {
                  console.log(err)
                }
                console.log('image was saved in s3')
                var s3Url = 'https://s3.amazonaws.com/image-processor-moderator/output/img300crop.jpg'
                sendMessage(sqs, modLabels, s3Url, function (err, data) {
                  if (err) {
                    console.log(err)
                  }
                  console.log(data)
                })
              })
            })
            // send message to Output SQS queue with moderation labels and location of output image
          })
      })
    })
  })
})

/* create a new SQS output_image_queue
var outputQueueParams = {
  MessageBody: 'output image', /* required 
  QueueUrl: 'https://sqs.us-east-1.amazonaws.com/021919146663/output_image_queue', /* required 
  DelaySeconds: 0,
  MessageAttributes: {
    'location': {
      DataType: 'String', 

      StringValue: 'STRING_VALUE'
    },
  },
  MessageDeduplicationId: 'STRING_VALUE',
  MessageGroupId: 'STRING_VALUE'
};
sqs.sendMessage(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

*/