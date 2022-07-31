import { loginFunc } from "../utils/login";
import { Page } from "puppeteer";

beforeEach(async() => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

const withdrawDigital = async(page: Page) => {
  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=提现管理]')
  await page.click('[title=提现管理]')

  await page.waitForSelector('.ant-menu-submenu')
  await page.waitForTimeout(1000);
  await page.click('[title=提币]')

  await page.waitForResponse(res => res.url().includes('/receipt/account/getAccountInfo') && res.status() === 200); 

  await page.waitForSelector('#basic_fiat')
  await page.click('#basic_fiat')
  await page.keyboard.press('Enter')

  await page.waitForResponse(res => res.url().includes('/receipt/account/getDigitalWithdrawConfig') && res.status() === 200); 

  await page.waitForSelector('#basic_withdrawalNumber')
  await page.click('#basic_withdrawalNumber')
  await page.keyboard.type('10')

  await page.waitForSelector('#basic_address')
  await page.click('#basic_address')
  await page.keyboard.type('0xE6725AB01657246d7026Ffda1f853456a307F613')

  await page.waitForSelector('#basic_password')
  await page.click('#basic_password')
  await page.keyboard.type('Xyc980830')

  await page.waitForSelector('.ant-form-item-control-input-content > .app-btn-submit-lg')
  await page.click('.ant-form-item-control-input-content > .app-btn-submit-lg')
}

describe('数字货币提币test', () => {
  it('数字货币提币 submit', async () => {
    await withdrawDigital(page);
    // get '/receipt/account/fiatWithdrawToBank' response
    const response = await page.waitForResponse(response => response.url().includes('/receipt/account/digitalWithdraw') && response.status() === 200);
    const resJson:any = await response.json();
    expect(resJson.success).toBe(true);
  })
})