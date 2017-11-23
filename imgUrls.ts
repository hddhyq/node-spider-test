import * as R from 'request'
import * as cheerio from 'cheerio'
import sleep from './sleep'
import { setTimeout } from 'timers';

const uri = 'http://www.diyidan.com'
const wz = 'http://www.diyidan.com/main/area/120017/'


// 需要爬取多少面
function countPages(length: number, from: number = 1): string[] {
  let wzs: string[] = []
  const start = from
  for (from; from < (length + start); from++) {
    let url = wz + from
    wzs.push(url)
  }
  return wzs
}

// 获取包含图片的URL
async function getImgPages(pages: string[]) {
  const taskQ = pages.map(async (v, k) => {
    await sleep(1000 * k)   // 第二个节流方法
    return getPages(v)
  })

  let pageArray = await Promise.all(taskQ)
  const pagesArray = pageArray.reduce((prev, current) => prev.concat(current), [])
  return pagesArray
}

// 单个分页获取包涵图片URL
function getPages(url: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      R(url, (err, res, body) => {
        const $ = cheerio.load(body)
        let liDom = $('body > div.content.clr > div.content_left > div.post_list_block_div > ul > li')
        const Pages = getPagesFromDom(liDom)
        resolve(Pages)
      })
    }, 1000)
  })
}

// 解析单个界面的li　Dom的url
function getPagesFromDom(dom: Cheerio) {
  return Array.from(dom).map((v, k) => {
    let t = v.attribs['onclick']
    let url = uri + t.substring(24, t.length - 2)
    return url
  })
}

// 导出的模块，负责输入页面下载

function imgPages(length: number, from?: number) {
  return getImgPages(countPages(length, from))
}

export default imgPages
