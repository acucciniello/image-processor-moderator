module.exports = deleteMessage

var queueURL = 'https://sqs.us-east-1.amazonaws.com/021919146663/image-processor-input'

function deleteMessage(sqs, data) {
  var deleteParams = {
    QueueUrl: queueURL,
    ReceiptHandle: data.Messages[0].ReceiptHandle
  }
  sqs.deleteMessage(deleteParams)
}

