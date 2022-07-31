import { loginFunc } from "../utils/login";

type ExchangeDataModel = {
  // digital coin: USDT:0, USDC:1, CNHC:2
  digitalCoin: number;
  // fiat coin: USD:0, CNH: 1
  fiatCoin: number;
  // digital coin amount
  digitalCoinAmount: number;
  pwd: string;
  // expect result: success 0 or fail 1
  expectResult: number;
}

const digitalMap = {
  0: 'USDT',
  1: 'USDC',
  2: 'CNHC'
}

const fiatMap = {
  0: 'USD',
  1: 'CNH'
}

const exchangeTest:ExchangeDataModel[] = [
  {
    digitalCoin: 0,
    fiatCoin: 0,
    digitalCoinAmount: 0.1,
    pwd: 'Xyc980830',
    expectResult: 0
  },
  // CNHC to CNH exchange
  {
    digitalCoin: 2,
    fiatCoin: 1,
    digitalCoinAmount: 0.1,
    pwd: 'Xyc980830',
    expectResult: 0
  },
  // USDC to USD exchange 2000, expect fail
  {
    digitalCoin: 1,
    fiatCoin: 0,
    digitalCoinAmount: 2000,
    pwd: 'Xyc980830',
    expectResult: 1
  }
];

beforeEach(async() => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})



describe('兑换管理', () => {
  it(`兑换`, async () => {

    await page.waitForSelector('.ant-pro-sider-menu')

    await page.waitForSelector('[title=兑换管理]')
    await page.click('[title=兑换管理]')

    await page.waitForResponse(response => response.url().includes('/receipt/account/getAccountInfo') && response.status() === 200);
    await page.waitForTimeout(1000)
    await page.click('#basic_sell')
    // await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await page.waitForSelector('#basic_buy')
    await page.click('#basic_buy')
    await page.keyboard.press('Enter')

    await page.waitForSelector('#basic_count')
    await page.type('#basic_count','1')

    await page.waitForSelector('#basic_password')
    await page.type('#basic_password','Xyc980830')

    await page.waitForSelector('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')
    await page.click('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')

    await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchangeValidate') && response.status() === 200);

    await page.waitForSelector('.ant-row > .ant-btn-primary')
    await page.click('.ant-row > .ant-btn-primary')

    const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchange') && response.status() === 200);
    const exchangeResultJson = await exchangeResult.json();

    expect(exchangeResultJson.success).toBe(true);
  });
})