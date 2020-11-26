import { Injectable } from '@nestjs/common'
import * as puppeteer from 'puppeteer'
import { Logger } from '../common/logger'

@Injectable()
export class Scraper {
  constructor(private readonly logger: Logger) {}
  async sendDeclaration(url: string): Promise<string> {
    const browser = await this.newBrowser()

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

      await page.waitForSelector('#linkLabel')

      return await page.$eval('#linkLabel', el => el.textContent)
    } catch (ex) {
      this.logger.error(`sendDeclaration failed: ${ex}`)
      throw ex
    } finally {
      await browser.close()
    }
  }

  async scrapeName(url: string): Promise<string> {
    const browser = await this.newBrowser()

    try {
      const page = await browser.newPage()
      page.setViewport({ width: 1400, height: 700, deviceScaleFactor: 2 })

      await page.goto(url, { waitUntil: 'networkidle0' })

      await page.waitForSelector('#childName')

      return await page.$eval('#childName', el => el.textContent)
    } catch (ex) {
      this.logger.error(`scrapeName failed: ${ex}`)
      throw ex
    } finally {
      await browser.close()
    }
  }

  private newBrowser(): Promise<puppeteer.Browser> {
    return puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    })
  }
}
