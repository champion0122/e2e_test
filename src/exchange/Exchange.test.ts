import { Page } from "puppeteer";
import { loginFunc } from "../utils/login";

type ExchangeData = {
  // digital coin: USDT:0, USDC:1, CNHC:2
  digitalCoin: 0 | 1 | 2;
  // fiat coin: USD:0, CNH: 1
  fiatCoin: 0 | 1;
  // digital coin amount
  digitalCoinAmount: string;
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

const exchangeTestData:ExchangeData[] = [
  {
    digitalCoin: 0,
    fiatCoin: 0,
    digitalCoinAmount: '1',
    pwd: 'Xyc980830',
    expectResult: 0
  },
  // CNHC to CNH exchange
  {
    digitalCoin: 2,
    fiatCoin: 1,
    digitalCoinAmount: '1',
    pwd: 'Xyc980830',
    expectResult: 0
  },
  // USDC to USD exchange 2000, expect fail
  {
    digitalCoin: 1,
    fiatCoin: 0,
    digitalCoinAmount: '2000',
    pwd: 'Xyc980830',
    expectResult: 1
  }
];

const exchangeAction = async(page: Page, digitalCoin: number, fiatCoin: number,digitalCoinAmount: string, pwd: string) => {
  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=兑换管理]')
  await page.click('[title=兑换管理]')

  await page.waitForResponse(response => response.url().includes('/receipt/account/getAccountInfo') && response.status() === 200);
  await page.waitForTimeout(1000)
  await page.click('#basic_sell')
  // 选中对应数字货币
  for(let i = 0; i < digitalCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')

  await page.waitForSelector('#basic_buy')
  await page.click('#basic_buy')
  // 选中对应法币
  for(let i = 0; i < fiatCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')

  await page.waitForSelector('#basic_count')
  await page.type('#basic_count',digitalCoinAmount)

  await page.waitForSelector('#basic_password')
  await page.type('#basic_password',pwd)

  await page.waitForSelector('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')
  await page.click('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')

  await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchangeValidate') && response.status() === 200);

  await page.waitForSelector('.ant-row > .ant-btn-primary')
  await page.click('.ant-row > .ant-btn-primary')
}

beforeEach(async() => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

describe.each(exchangeTestData)(`兑换测试`, (item: ExchangeData) => {
  // define variables from ExchangeData keys
  const { digitalCoin, fiatCoin, digitalCoinAmount, pwd, expectResult } = item;
  const isExchangeSuccess = expectResult === 0;
  const text = isExchangeSuccess ? `${digitalMap[digitalCoin]} to ${fiatMap[fiatCoin]}兑换成功` : `${digitalMap[digitalCoin]} to ${fiatMap[fiatCoin]}兑换失败`;
  test(text, async () => {
    await exchangeAction(page,digitalCoin, fiatCoin,digitalCoinAmount, pwd);

    if(isExchangeSuccess){
      const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchange') && response.status() === 200, {timeout: 2000});
      const exchangeResultJson = await exchangeResult.json();

      await expect(exchangeResultJson.success).toBe(isExchangeSuccess);
    }else {
      await page.waitForSelector('.ant-form-item-explain-error');
      const errorText = await page.$eval('.ant-form-item-explain-error', el => (el as HTMLElement).innerText);
      await expect(errorText).toBe('兑换数量不可超过可用数量！');
    }
  }, 20000);
})