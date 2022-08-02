import { ElementHandle, Page } from 'puppeteer';
import { loginFunc } from '../utils/login';

type PaymentData = {
  // 非货物贸易 0 货物贸易 1
  paymentType: 0 | 1,
  // 付款币种 USD: 0 CNH: 1
  paymentCoin: 0 | 1,
  // 交易类型 线下一般货物贸易 0 电商 1
  tradeType?: 0 | 1,
  // 付款账户类型 离岸账户: 0 在岸账户: 1
  paymentAccountType: 0 | 1,
  // 付款数量
  paymentAmount?: string,
  // 到账金额
  paymentAmountTo?: string,
  // 收款账户 从0开始
  paymentAccount: number,
  // 支付密码
  pwd: string,
  // 预期结果 0 成功 1 失败
  expectResult: 0 | 1,
  // 付款附言
  postScript?: string,
  // 操作备注
  remark?: string,
}

const paymentCoinMap = {
  0: 'USD',
  1: 'CNH'
}

const paymentTestData: PaymentData[] = [
  {
    paymentType: 1,
    paymentCoin: 1,
    paymentAccountType: 0,
    paymentAmount: '10',
    paymentAccount: 0,
    pwd: '123456',
    expectResult: 0,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
  {
    paymentType: 0,
    paymentCoin: 1,
    paymentAccountType: 0,
    paymentAmountTo: '10',
    paymentAccount: 1,
    pwd: '123456',
    expectResult: 0,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
  {
    paymentType: 0,
    paymentCoin: 1,
    paymentAccountType: 0,
    paymentAmount: '10',
    paymentAccount: 1,
    pwd: '1234561',
    expectResult: 1,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
]

const fiatPay = async (page: Page, paymentData: PaymentData) => {
  const { paymentType, paymentCoin, tradeType, paymentAccountType, paymentAmount, paymentAmountTo, paymentAccount, pwd, expectResult, postScript, remark } = paymentData;

  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=付款管理]')
  await page.click('[title=付款管理]')

  await page.waitForSelector('.ant-menu-submenu')
  await page.waitForTimeout(1000);
  await page.click('[title=付款]')

  await page.waitForTimeout(1000);

  await page.waitForSelector('#basic_type > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')
  await page.click('#basic_type > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

  // 根据paymentType选择付款类型
  if (paymentType === 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await page.click('#basic_tradeType > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

    if (tradeType === 1) {
      await page.keyboard.press('ArrowRight');
    }

    const uploaders: Array<ElementHandle> = await page.$$('.ant-upload > input');
    for (let i = 0; i < uploaders.length - 1; i++) {
      await uploaders[i].uploadFile('assets/lake.jpeg')
      await page.waitForTimeout(1500)
    }
  }

  await page.waitForSelector('#basic_currency')
  await page.waitForTimeout(1000);
  await page.click('#basic_currency')
  await page.waitForTimeout(1000);
  for (let i = 0; i < paymentCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');


  await page.waitForSelector('#basic_isOnshore > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')
  await page.click('#basic_isOnshore > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

  // 根据paymentAccountType选择付款账户类型
  if (paymentAccountType === 1) {
    await page.keyboard.press('ArrowRight');
    // await page.waitForTimeout(1000);
    await page.waitForResponse(response => response.url().includes('/receipt/payBankAccount/getPayPassBanks') && response.status() === 200);
  }

  await page.click('#basic_amount')
  if (paymentAmount) {
    await page.type('#basic_amount', paymentAmount)
  } else {
    await page.type('#basic_arriveAmount', paymentAmountTo)
  }

  await page.waitForTimeout(3000);
  // await page.waitForSelector('#basic_bankId')
  // await page.waitForTimeout(2000);
  await page.click('#basic_bankId')

  // 选择账号下拉框第i项
  await page.waitForTimeout(1000);
  for (let i = 0; i < paymentAccount; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');

  await page.type('#basic_payPassword', pwd)

  await page.type('#basic_toPayeePostscript', postScript)

  await page.type('#basic_operationNote', remark)

  await page.waitForSelector('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
  await page.click('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
}

beforeEach(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

describe.each(paymentTestData)(`付款测试`, (item: PaymentData) => {
  const { paymentCoin, expectResult, paymentAmount, paymentAmountTo } = item;
  const isWithdrawSuccess = expectResult === 0;
  const text = isWithdrawSuccess ? `${paymentCoinMap[paymentCoin]} 付款 ${paymentAmount ?? paymentAmountTo} 成功` : `${paymentCoinMap[paymentCoin]} 付款 ${paymentAmount ?? paymentAmountTo} 失败`;
  test(text, async () => {
    await fiatPay(page, item);
    const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/account/fiatPayToBank') && response.status() === 200, {timeout: 4000});
    const exchangeResultJson:any = await exchangeResult.json();

    await expect(exchangeResultJson.success).toBe(isWithdrawSuccess);
  }, 60000);
});

afterEach(async () => {
  await page.waitForTimeout(2000)
})