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
      await page.waitForSelector('#sendBtn')

      await page.evaluate(() => {
        document
          .querySelectorAll('input[type="checkbox"]')
          .forEach((cb: HTMLElement) => cb.click())
      })

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
