const sharp = require('sharp')
const glob = require('glob')
const fs = require('fs-extra')

const clanFolder = 'images/Destiny 2/Clan Banners DM or tweet me @silentwalker__ for more info'

let max
let current = 0

function skipFile (outFilePath, log = true) {
  current++
  if (log) console.log(`Skipped (Discord) "${outFilePath}" (${current}/${max})`)
}

async function optimiseFile (filePath) {
  let parentDir = filePath.split('/')
  const fileName = parentDir.pop().split('.').shift()
  parentDir = parentDir.join('/')
  const outFilePath = filePath.replace('thumbs/', '')

  const outputDir = parentDir.replace('thumbs/', 'discord/')
  const outputPath = `${outputDir}/${fileName}`

  if (filePath.startsWith(clanFolder)) return skipFile(outFilePath, false)

  if (fs.existsSync(`${outputPath}.jpg`)) return skipFile(outFilePath)

  await fs.ensureDir(outputDir)

  const image = sharp(filePath)
  const metadata = await image.metadata()

  const isLandscape = metadata.width > metadata.height
  const baseSize = isLandscape ? metadata.height : metadata.width

  await image
    .extract({
      top: Math.floor(isLandscape ? 0 : (metadata.height - metadata.width) / 2),
      left: Math.floor(isLandscape ? (metadata.width - metadata.height) / 2 : 0),
      width: baseSize,
      height: baseSize
    })
    .toFile(`${outputPath.replace('thumbs/', 'discord/')}.jpg`)

  current++
  console.log(`Created Discord thumbnail for "${outFilePath}" (${current}/${max})`)
}

async function main () {
  const files = glob.sync('thumbs/**/*.{jpg,jpeg,png}')
  max = files.length

  await Promise.all(files.map(f => optimiseFile(f)))
}

main()
