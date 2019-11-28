// Copyright Jacob Niedzwiecki, 2019
// Released under the MIT License (see /LICENSE)

const QRCode = require('qrcode')

exports.getQRCode = (url) => {
  return QRCode.toString(url, { type: 'svg' })
}