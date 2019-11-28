// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const QRCode = require('qrcode')

exports.getQrcode = (url) => {
  return QRCode.toData(url).then( qrCode => {
    console.log(qrCode)
  })
}