import { Inject, Injectable } from '@nestjs/common'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import * as puppeteer from 'puppeteer'
import { Logger } from 'winston'

@Injectable()
export class Scraper {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private logger: Logger) {}
  async sendHealthStatement(url: string): Promise<string> {
    const browser = await this.newBrowser()

    try {
      const page = await browser.newPage()
      page.setViewport({ width: 1400, height: 700, deviceScaleFactor: 2 })

      await page.goto(url, { waitUntil: 'networkidle0' })

      for (const id of [
        '#cb_no_fever',
        '#cb_no_corona_signs',
        '#cb_no_corona_touch',
        '#cb_no_change_in_smell',
        '#cb_no_last48_fever',
        '#cb_no_return_from_abroad',
      ]) {
        await page.click(id, { delay: 20 })
      }

      await page.click('#sendBtn', { delay: 30 })

      await page.waitForSelector('#linkLabel')

      return await page.$eval('#linkLabel', el => el.textContent)
    } catch (ex) {
      this.logger.error(`sendHealthStatement failed: ${ex}`)
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
