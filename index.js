const puppeteer = require('puppeteer')

const HOST = 'https://popcat.click'
const POP_ENDPOINT = 'https://stats.popcat.click/pop?pop_count='
const SECONDS_IN_MS = 1000
const COUNTER_SELECTOR = '.counter'

const execute = async () => {
    const browser = await puppeteer.launch()
    try {
        let totalPops = 0

        const page = await browser.newPage()
        page.setUserAgent('Mozilla/5.0 (Macintosh Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73')
        page.on('requestfinished', async (request) => {
            if (!request.url().startsWith(POP_ENDPOINT)) {
                return
            }

            const responseStatus = (await request.response()).status()
            if (responseStatus == 201) {
                const popCount = parseInt(/^[^\d]*(\d+)/.exec(request.url())[1])
                totalPops += popCount
                console.info(`Pop count=${popCount} is updated successfully! Total pops=${totalPops}`)
            } else {
                console.warn(`Pop count is not updated, got ${responseStatus}`)
            }
        })

        await page.goto(HOST)
        await page.waitForSelector(COUNTER_SELECTOR)
        await page.evaluate(function () {
            const KEY_DOWN_EVENT = new KeyboardEvent('keydown', { key: 'a' })
            const KEY_UP_EVENT = new KeyboardEvent('keyup', { key: 'a' })
            const INTERVAL = 30

            setInterval(() => {
                document.dispatchEvent(KEY_DOWN_EVENT)
                document.dispatchEvent(KEY_UP_EVENT)
            }, INTERVAL)
        })

        console.info('started!')

        while (true) {
            await new Promise(res => setTimeout(res, SECONDS_IN_MS))
        }
    } catch (error) {
        console.error(`${error}`)
    } finally {
        await browser.close()
        console.info('existed!')
    }
}

execute()
