var index = require('./index.js')

exports.handler = function(event, context, callback) {
  index(function (err, success) {
    console.log('Test')
    if (err) {
      console.log('we failed at: ' + err)
    }
    context.succeed('we finished: ' + success)
  })
}