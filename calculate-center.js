module.exports = CalculateCenter

function CalculateCenter(data, width, height) {
  var center = {
    column: 0,
    row: 0
  }
  var widthBox = data.FaceDetails[0].BoundingBox.Width
  var heightBox = data.FaceDetails[0].BoundingBox.Height
  var topBox = data.FaceDetails[0].BoundingBox.Top
  var leftBox = data.FaceDetails[0].BoundingBox.Left

  var topinPx = topBox*height
  var leftinPx = leftBox*width
  var heightBoxPx = heightBox*height
  var widthBoxPx = widthBox*width
  center.column = Math.floor(leftinPx + (widthBoxPx/2))
  center.row = Math.floor(topinPx + (heightBoxPx/2))

  return center
}