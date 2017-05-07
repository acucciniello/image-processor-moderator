module.exports = sendMessage

function sendMessage(sqs, modLabels, s3Url, callback) {
  console.log(modLabels)
  console.log(JSON.stringify(modLabels))
  var outputQueueParams = {
    MessageBody: 'output image', 
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/021919146663/output_image_queue',
    DelaySeconds: 0,
    MessageAttributes: {
      'location': {
        DataType: 'String', 
        StringValue: s3Url
      },
      'moderationLabels' : {
        DataType: 'String',
        StringValue: JSON.stringify(modLabels)
      }
    }
  }
  sqs.sendMessage(outputQueueParams, function (err, data) {
    if (err) {
      callback(err)
      return
    }
    callback(null, data)
  })
}