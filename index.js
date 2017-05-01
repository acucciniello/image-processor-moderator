var AWS = require('aws-sdk')
AWS.config.loadFromPath('./aws.credentials.json')

var sqs = new AWS.SQS({apiVersion: '2012-11-05'})

var queueURL = 'https://sqs.us-east-1.amazonaws.com/021919146663/image-processor-input'

var params = {
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

sqs.receiveMessage(params, function(err, data) {
  if (err) {
    console.log('Receive error', err)
  } else {
    console.log(data.Messages[0].MessageAttributes.source.StringValue) /*
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