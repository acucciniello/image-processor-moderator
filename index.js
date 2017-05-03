var AWS = require('aws-sdk')
AWS.config.loadFromPath('./aws.credentials.json')

var sqs = new AWS.SQS({apiVersion: '2012-11-05'})
var s3 = new AWS.S3({apiVersion: '2006-03-01'})

var queueURL = 'https://sqs.us-east-1.amazonaws.com/021919146663/image-processor-input'

var sqsParams = {
  AttributeNames: [
    'SentTimestamp'
  ],
  MaxNumberOfMessages: 1,
  MessageAttributeNames: [
    'All'
  ],
  QueueUrl: queueURL,
  VisibilityTimeout: 0,
  WaitTimeSeconds: 0
}

/*var s3Params = {
  Bucket: 'image-processor-moderator',
  // CopySource: 'image-processor-moderator/source/person1.jpg',
  Key: 'source/person1.jpg'
}*/

sqs.receiveMessage(sqsParams, function(err, data) {
  if (err) {
    console.log('Receive error', err)
  } else {
    var s3Link = data.Messages[0].MessageAttributes.source.StringValue
    // console.log(data.Messages[0].MessageAttributes.source.StringValue)
    var s3Params = parseSQS(s3Link)
    console.log(s3Params)
    s3.getObject(s3Params, function (err, data) {
      if(err) {
        console.log(err)
      }
      console.log(data)
    })

     /*
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle
    }
    sqs.deleteMessage(deleteParams, function(err, data) {
      if (err) {
        console.log('Delete Error', err)
      } else {
        console.log('Message Deleted', data)
      }
    }) */
  }
})
	
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