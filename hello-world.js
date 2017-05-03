var sqs = require('./index.js')

exports.handler = function(event, context) {
  
  context.succeed("Hello, World!")
}