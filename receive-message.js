var parseSQS = require('./parse-sqs.js')
var deleteMessage = require('./delete-message.js')
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

module.exports = Receive

function Receive (sqs, callback) {
  sqs.receiveMessage(sqsParams, function (err, data) {
    if (err) {
    console.log('Receive error', err)
    callback(err)
  } else {
      var s3Link = data.Messages[0].MessageAttributes.source.StringValue
      // deleteMessage(sqs, data)
      var s3Params = parseSQS(s3Link)
      callback(null, s3Params)
    }
  })
}