import * as R from 'request'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import getImgPages from './imgUrls'
import sleep from './sleep'

let imageUrls: string[] = []

// 获取图片ｕｒｌ
function getImgUrl(url: string): Promise<string[]> {
  return new Promise((resolve, resject) => {
    R(url, (err, res, body) => {
      const $ = cheerio.load(body)
      let ImgDom = $('body > div.content.clr > div.content_left > div > section > div.user_post > div.user_post_content > p > a > img')
      let Urls = getUrlsFromDom(ImgDom)
      resolve(Urls)
    })
  })
}

function getUrlsFromDom(dom: Cheerio) {
  return Array.from(dom).map((v, k) => {
    let t = v.attribs['src']
    let url = 'http:' + t
    return url
  })
}

// 存储图片
async function saveImg(url: string) {
  if (!fs.existsSync('./images')) {
    await fs.mkdirSync('./images')
  }
  R.get(url)
    .on('error', (error) => {
      console.log(error)
    })
    .pipe(fs.createWriteStream('images/' + Math.random() + '.png'))
}


async function timeout(data: string[], i: number = 0) {
  if (i < data.length + 1) {
    await sleep(10000)
    i++
    await timeout(data, i++)
  }
}

// imgUrls 获取单个页面的IMG的计时器

async function getSingleImg(imgUrls: string[], i: number = 0) {
  if (i< imgUrls.length) {
    await sleep(1000)
    i++
    let urls = await getImgUrl(imgUrls[i])
    await urls.forEach((item) => {
      saveImg(item)
      console.log('单页面打印成功')
    })
    imageUrls = await imageUrls.concat(urls)
    await getSingleImg(imgUrls, i++)
  }
}

// getImgPages(2).then((v) => {
//   v.forEach(async (item) => {
//     await console.log(item)
//   })
// })

async function run() {
  let imgUrls = await getImgPages(50)
  console.log(imgUrls.length)
  await getSingleImg(imgUrls)
  // console.log(imageUrls.length)
  // await getImgUrl('http://www.diyidan.com/main/post/6294360860110386283/detail/1').then((v) => {
  //   return v
  // }).then((v) => {
  //   v.forEach((item) => {
  //     saveImg(item)
  //     console.log('单页面打印成功')
  //   })
  // })

}

run()