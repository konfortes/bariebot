import { Injectable } from '@nestjs/common'
import * as puppeteer from 'puppeteer'
import { Logger } from '../common/logger'

@Injectable()
export class Scraper {
  constructor(private readonly logger: Logger) {}
  async declare(url: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    })

    try {
      const page = await browser.newPage()
      page.setViewport({ width: 1400, height: 700, deviceScaleFactor: 2 })

      await page.goto(url, { waitUntil: 'networkidle0' })

      for (const id of [
        '#cb_no_fever',
        '#cb_no_corona_signs',
        '#cb_no_corona_touch',
      ]) {
        await page.click(id, { delay: 20 })
      }

      await page.click('#sendBtn', { delay: 30 })

      return await page.$eval('#linkLabel', el => el.textContent)
    } catch (ex) {
      this.logger.error(`scrape failed: ${ex}`)
      throw ex
    } finally {
      await browser.close()
    }
  }
}
