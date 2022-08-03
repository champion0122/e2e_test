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
  expectMsg?: string;
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

const exchangeTestData: ExchangeData[] = [
  {
    digitalCoin: 0,
    fiatCoin: 0,
    digitalCoinAmount: '1',
    pwd: '123456',
    expectResult: 0
  },
  // CNHC to CNH exchange
  {
    digitalCoin: 2,
    fiatCoin: 1,
    digitalCoinAmount: '1',
    pwd: '123456',
    expectResult: 0
  },
  // USDC to USD exchange 2000, expect fail
  {
    digitalCoin: 1,
    fiatCoin: 0,
    digitalCoinAmount: '2000',
    pwd: '123456',
    expectResult: 1,
    expectMsg: '兑换数量不可超过可用数量！'
  },
  // {
  //   digitalCoin: 0,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 1,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 2,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 2,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 0,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 1,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 2,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
  // {
  //   digitalCoin: 2,
  //   fiatCoin: 1,
  //   digitalCoinAmount: '1',
  //   pwd: '123456',
  //   expectResult: 0
  // },
];

const exchangeAction = async (page: Page, digitalCoin: number, fiatCoin: number, digitalCoinAmount: string, pwd: string) => {

  await page.waitForResponse(response => response.url().includes('/receipt/account/getAccountInfo') && response.status() === 200);
  await page.waitForTimeout(1000);
  await page.click('#basic_sell')
  // 选中对应数字货币
  await page.waitForTimeout(1000);
  for (let i = 0; i < digitalCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')

  //  切换到对应法币select框
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1000);
  for (let i = 0; i < fiatCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter')

  // 等待汇率获取完成
  await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/getExchangeConfig') && response.status() === 200);

  // 输入数字货币数量
  await page.keyboard.press('Tab');
  await page.keyboard.type(digitalCoinAmount);

  await page.keyboard.press('Tab');
  await page.keyboard.type(pwd);

  await page.waitForTimeout(1500)
  await page.waitForSelector('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')
  await page.click('.ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn')

  try {
    await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchangeValidate') && response.status() === 200, { timeout: 4000 });

    await page.waitForSelector('.ant-row > .ant-btn-primary')
    await page.click('.ant-row > .ant-btn-primary')
  } catch (e) {
    // console.error(e);
    return;
  }
}

beforeEach(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

beforeEach(async () => {
  await page.goto('http://localhost:8001/ExchangeManagement/DigitalCurrencyExchange');
})

afterEach(async () => {
  await page.waitForTimeout(2000)
})

describe.each(exchangeTestData)(`兑换测试`, (item: ExchangeData) => {
  // define variables from ExchangeData keys
  const { digitalCoin, fiatCoin, digitalCoinAmount, pwd, expectResult, expectMsg } = item;
  const isExchangeSuccess = expectResult === 0;
  const text = isExchangeSuccess ? `${digitalMap[digitalCoin]} to ${fiatMap[fiatCoin]}兑换成功` : `${digitalMap[digitalCoin]} to ${fiatMap[fiatCoin]}兑换失败`;
  test(text, async () => {
    await exchangeAction(page, digitalCoin, fiatCoin, digitalCoinAmount, pwd);

    try {
      const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/digitalExchange/exchange') && response.status() === 200, { timeout: 4000 });
      const exchangeResultJson: any = await exchangeResult.json();

      await expect(exchangeResultJson.success).toBe(isExchangeSuccess);
    } catch (e) {
      await page.waitForSelector('.ant-form-item-explain-error');
      const errorText = await page.$eval('.ant-form-item-explain-error', el => (el as HTMLElement).innerText);
      // console.log(errorText);
      await expect(errorText).toBe(expectMsg);
    }
  }, 60000);
})