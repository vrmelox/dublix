// qr-generator.ts (TypeScript ou JS)
import QRCode from 'qrcode'

const url = 'http://localhost:3000/equipment/EQP001'

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