import { ElementHandle, Page } from 'puppeteer';
import { loginFunc } from '../utils/login';

type WithdrawData = {
  // 非货物贸易 0 货物贸易 1
  withdrawType: 0 | 1,
  // 提现币种 USD: 0 CNH: 1
  withdrawCoin: 0 | 1,
  // 交易类型 线下一般货物贸易 0 电商 1
  tradeType?: 0 | 1,
  // 提现账户类型 离岸账户: 0 在岸账户: 1
  withdrawAccountType: 0 | 1,
  // 提现数量
  withdrawAmount?: string,
  // 到账金额
  withdrawAmountTo?: string,
  // 提现账户 从0开始
  withdrawAccount: number,
  // 支付密码
  pwd: string,
  // 预期结果 0 成功 1 接口失败 2 兑换服务关闭
  expectResult: 0 | 1 | 2,
  // 失败提示
  expectResultText?: string,
  // 提现附言
  postScript?: string,
  // 操作备注
  remark?: string,
}

const withdrawCoinMap = {
  0: 'USD',
  1: 'CNH'
}

const withdrawTestData: WithdrawData[] = [
  {
    withdrawType: 0,
    withdrawCoin: 0,
    withdrawAccountType: 0,
    withdrawAmount: '10',
    withdrawAccount: 1,
    pwd: '123456',
    expectResult: 0,
    postScript: 'asdasd  waewqea       sdasd  waewq      test',
    remark: 'wadaxiwa                                                gein'
  },
  {
    withdrawType: 0,
    withdrawCoin: 0,
    withdrawAccountType: 0,
    withdrawAmount: '10',
    withdrawAccount: 1,
    pwd: '1234567',
    expectResult: 1,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest',
    expectResultText: '支付密码验证失败'
  },
  {
    withdrawType: 0,
    withdrawCoin: 1,
    withdrawAccountType: 1,
    withdrawAmount: '10',
    withdrawAccount: 1,
    pwd: '123456',
    expectResult: 2,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
]

// 1. try catch
// 2. tab
// 3. scroll
const withdraw = async (page: Page, withdrawData: WithdrawData) => {
  const { withdrawType, withdrawCoin, tradeType, withdrawAccountType, withdrawAmount, withdrawAmountTo, withdrawAccount, pwd, postScript='', remark='' } = withdrawData;

  await page.waitForResponse(response => response.url().includes('/receipt/bankAccount/getPassBanks') && response.status() === 200);
  await page.waitForSelector('#basic_withdrawType > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')
  await page.click('#basic_withdrawType > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

  // 根据withdrawType选择提现类型
  if (withdrawType === 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await page.click('#basic_tradeType > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

    if (tradeType === 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
    }

    const uploaders: Array<ElementHandle> = await page.$$('.ant-upload > input');
    for (let i = 0; i < uploaders.length - 1; i++) {
      await uploaders[i].uploadFile('assets/lake.jpeg')
      await page.waitForTimeout(1500)
    }
  }

  await page.waitForTimeout(2000);
  await page.waitForSelector('#basic_fiat')
  await page.click('#basic_fiat')
  await page.waitForTimeout(1000);
  for (let i = 0; i < withdrawCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');

  await page.keyboard.press('Tab')
  // 根据withdrawAccountType选择提现账户类型,银行账户也会变化需等待请求
  if (withdrawAccountType === 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForResponse(response => response.url().includes('/receipt/bankAccount/getPassBanks') && response.status() === 200);
  }

  await page.keyboard.press('Tab')
  if (withdrawAmount) {
    await page.keyboard.type(withdrawAmount)
    await page.keyboard.press('Tab')
  } else {
    await page.keyboard.press('Tab')
    await page.keyboard.type(withdrawAmountTo)
  }

  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  // 选择账号下拉框第i项
  await page.waitForTimeout(1000);
  for (let i = 0; i < withdrawAccount; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');

  // 选中的是“添加提现账户”
  await page.keyboard.press('Tab')

  // 支付密码
  await page.keyboard.press('Tab')
  await page.keyboard.type(pwd)

  await page.keyboard.press('Tab')
  await page.keyboard.type(postScript)

  await page.keyboard.press('Tab')
  await page.keyboard.type(remark)

  await page.waitForSelector('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
  await page.click('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
}

beforeAll(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

beforeEach(async () => {
  await page.goto('http://localhost:8001/WithdrawalManagement/Withdraw');
})

describe.each(withdrawTestData)(`提现测试`, (item: WithdrawData) => {
  const { withdrawCoin, expectResult, withdrawAmount, withdrawAmountTo, expectResultText = '' } = item;
  const isWithdrawSuccess = expectResult === 0;
  const text = isWithdrawSuccess ? `${withdrawCoinMap[withdrawCoin]} 提现 ${withdrawAmount ?? withdrawAmountTo} 成功` : `${withdrawCoinMap[withdrawCoin]} 提现 ${withdrawAmount ?? withdrawAmountTo} 失败 ${expectResultText}`;
  test(text, async () => {
    await withdraw(page, item);

    if (expectResult !== 2) {
      const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/account/fiatWithdrawToBank') && response.status() === 200, { timeout: 5000 });
      const exchangeResultJson: any = await exchangeResult.json();

      await expect(exchangeResultJson.success).toBe(isWithdrawSuccess);

      if (expectResultText) {
        const toastText = await page.$eval('div > .ant-message > div > .ant-message-notice > .ant-message-notice-content > div > span:nth-child(2)', el => (el as HTMLElement).innerText);
        // 对提示框文本的断言
        await expect(toastText).toMatch(expectResultText);
      }
    } else {
      await page.waitForSelector('.app-btn-submit-lg');
      const errorText = await page.$eval('.app-btn-submit-lg', el => (el as HTMLElement).innerText);
      // console.log(errorText);
      await expect(errorText).toBe('提现服务升级中，暂不支持提现');
    }
  }, 60000);
});

afterEach(async () => {
  await page.waitForTimeout(2000)
})