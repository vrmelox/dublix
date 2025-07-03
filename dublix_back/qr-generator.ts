// qr-generator.ts (TypeScript ou JS)
import QRCode from 'qrcode'

const url = 'https://bioqrsuivi.com/equipement/267342'

// Génération d'une image base64 (utile pour afficher dans une balise <img>)
QRCode.toDataURL(url, (err, qr) => {
  if (err) return console.error(err)
  console.log('QR Code en base64 :')
  console.log(qr)
})

QRCode.toFile('qrcode.png', url, {
  color: {
    dark: '#000',  // pixels du QR
    light: '#FFF'  // fond
  }
}, function (err) {
  if (err) throw err
  console.log('QR Code sauvegardé dans qrcode.png')
})