import { loginFunc } from "../utils/login";
import { ElementHandle, Page } from "puppeteer";

beforeEach(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

const withdraw = async (page: Page) => {
  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=付款管理]')
  await page.click('[title=付款管理]')

  await page.waitForSelector('.ant-menu-submenu')
  await page.waitForTimeout(1000);
  await page.click('[title=付款]')

  // await page.waitForNavigation();

  await page.waitForSelector('.ant-form-item-control-input-content > #basic_type > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  await page.click('.ant-form-item-control-input-content > #basic_type > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')

  await page.waitForSelector('.ant-form-item-control-input-content > #basic_tradeType > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  await page.click('.ant-form-item-control-input-content > #basic_tradeType > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')

  const uploaders: Array<ElementHandle> = await page.$$('.ant-upload > input');
  for (let i = 0; i < uploaders.length - 1; i++) {
    await uploaders[i].uploadFile('assets/lake.jpeg')
    await page.waitForTimeout(1500)
  }

  await page.waitForSelector('label[for=basic_currency]')
  await page.click('label[for=basic_currency]')
  // 选中下拉框第二项
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter');

  await page.waitForSelector('.ant-form-item-control-input-content > #basic_isOnshore > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  await page.click('.ant-form-item-control-input-content > #basic_isOnshore > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')

  await page.waitForSelector('#basic_amount')
  await page.click('#basic_amount')

  await page.type('#basic_arriveAmount', '10')

  // await page.waitForSelector('#basic_account')
  // await page.click('#basic_account')

  // 选择账号下拉框第一项
  await page.waitForSelector('label[for=basic_bankId]')
  await page.click('label[for=basic_bankId]')
  await page.keyboard.press('Enter');
  // await page.waitForSelector('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .app-select-option-pre:nth-child(2) > .ant-select-item-option-content')
  // await page.click('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .app-select-option-pre:nth-child(2) > .ant-select-item-option-content')

  await page.type('#basic_payPassword', 'Xyc980830')

  await page.type('#basic_toPayeePostscript', 'testtesttesttesttesttesttest')

  await page.type('#basic_operationNote', 'testtesttesttest')

  await page.waitForSelector('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn-primary')
  await page.click('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn-primary')
}


describe('付款 test', () => {
  it('付款 submit', async () => {
    await withdraw(page);
    // get '/receipt/account/fiatWithdrawToBank' response
    const response = await page.waitForResponse(response => response.url().includes('/receipt/account/fiatPayToBank') && response.status() === 200);
    const resJson: any = await response.json();
    expect(resJson.success).toBe(true);
  })
})