const puppeteer = require('puppeteer')

const SECONDS_IN_MS = 1000
const REPORT_INTERVAL_IN_S = 1
const COUNTER_SELECTOR = '.counter'

const execute = async () => {
    const browser = await puppeteer.launch()

    try {
        const page = await browser.newPage()
        page.setUserAgent('Mozilla/5.0 (Macintosh Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73')

        await page.goto('https://popcat.click')
        await page.waitForSelector(COUNTER_SELECTOR)
        await page.evaluate(function () {
            const EVENT = new KeyboardEvent('keydown', { key: 'SPACE' })
            const EXPECTED_CPS = 800 / 30
            const BATCH_SIZE = 1

            const interval = (1000 * BATCH_SIZE) / EXPECTED_CPS
            setInterval(() => {
                for (let i = 0; i < BATCH_SIZE; i++) {
                    document.dispatchEvent(EVENT)
                }
            }, interval)
        })

        let previousCnt = 0.0
        let currentCnt = 0.0
        let timeConsumed = 0
        while (true) {
            const element = await page.$(COUNTER_SELECTOR)
            currentCnt = parseFloat((await page.evaluate(el => el.textContent, element)).replace(/\,/g, '')) || 0.0

            console.log(`Total: ${currentCnt} clicks, current rate: ${((currentCnt - previousCnt) / REPORT_INTERVAL_IN_S).toFixed(2)} cps, average rate: ${(currentCnt / timeConsumed).toFixed(2)} cps`)
            previousCnt = currentCnt
            timeConsumed += REPORT_INTERVAL_IN_S

            await new Promise(res => setTimeout(res, SECONDS_IN_MS * REPORT_INTERVAL_IN_S))
        }
    } finally {
        await browser.close()
    }
}

execute()
