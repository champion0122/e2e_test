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
  // 预期结果 0 成功 1 失败
  expectResult: 0 | 1,
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
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
  {
    withdrawType: 0,
    withdrawCoin: 1,
    withdrawAccountType: 0,
    withdrawAmount: '10',
    withdrawAccount: 1,
    pwd: '123456',
    expectResult: 1,
    postScript: 'testtesttesttesttesttesttesttesttesttesttestttesttesttest',
    remark: 'testtesttesttesttesttesttesttesttesttesttest'
  },
]

const withdraw = async (page: Page, withdrawData: WithdrawData) => {
  const { withdrawType, withdrawCoin, tradeType, withdrawAccountType, withdrawAmount, withdrawAmountTo, withdrawAccount, pwd, expectResult, postScript, remark } = withdrawData;

  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=提现管理]')
  await page.click('[title=提现管理]')

  await page.waitForSelector('.ant-menu-submenu')
  await page.waitForTimeout(1000);
  await page.click('[title=提现]')

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
    for (let i = 0; i < uploaders.length; i++) {
      await uploaders[i].uploadFile('assets/lake.jpeg')
      await page.waitForTimeout(1500)
    }
  }



  /*
  // 采购协议
  await page.waitForSelector('#basic_purchaseProtocol > .ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload > .ant-upload > input')
  const uploader1 = await page.$('#basic_purchaseProtocol > .ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload > .ant-upload > input')
  await uploader1?.uploadFile('assets/lake.jpeg')
  await page.waitForTimeout(1500)

  // 采购订单明细
  const uploader2 = await page.$('#basic_purchaseOrderDetail > .ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload > .ant-upload > input')
  await uploader2?.uploadFile('assets/lake.jpeg')
  await page.waitForTimeout(1500)

  // 收据发票
  const uploader3 = await page.$('#basic_electronicCommerceInvoice > .ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload > .ant-upload > input')
  await uploader3?.uploadFile('assets/lake.jpeg')
  await page.waitForTimeout(1500)

  // 店铺URL
  const uploader4 = await page.$('#basic_electronicCommerceStoreUrl > .ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload > .ant-upload > input')
  await uploader4?.uploadFile('assets/lake.jpeg')
  await page.waitForTimeout(1500)
  
  // 物流订单
  const uploader5 = await page.$('.ant-upload-picture-card-wrapper > .ant-upload-list > .ant-upload:nth-child(1) > .ant-upload > input')
  await uploader5?.uploadFile('assets/lake.jpeg')
  await page.waitForTimeout(1500)
  */

  await page.waitForTimeout(5000);
  await page.waitForSelector('#basic_fiat')
  await page.click('#basic_fiat')
  for (let i = 0; i < withdrawCoin; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');


  await page.waitForSelector('#basic_isOnshore > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')
  await page.click('#basic_isOnshore > label.ant-radio-wrapper.ant-radio-wrapper-in-form-item')

  // 根据withdrawAccountType选择提现账户类型
  if (withdrawAccountType === 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
  }

  await page.click('#basic_withdrawNumber')
  if (withdrawAmount) {
    await page.type('#basic_withdrawNumber', withdrawAmount)
  } else {
    await page.type('#basic_arriveAmount', withdrawAmountTo)
  }

  await page.waitForSelector('#basic_account')
  await page.click('#basic_account')

  // 选择账号下拉框第i项
  for (let i = 0; i < withdrawAccount; i++) {
    await page.keyboard.press('ArrowDown')
  }
  await page.keyboard.press('Enter');

  await page.type('#basic_password', pwd)

  await page.type('#basic_toWithdrawalPostscript', postScript)

  // await page.type('#basic','testtesttesttest')

  await page.type('#basic_operationNote', remark)

  await page.waitForSelector('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
  await page.click('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
}

beforeEach(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

describe.each(withdrawTestData)(`提现测试`, (item: WithdrawData) => {
  const { withdrawCoin, expectResult, withdrawAmount, withdrawAmountTo } = item;
  const isWithdrawSuccess = expectResult === 0;
  const text = isWithdrawSuccess ? `${withdrawCoinMap[withdrawCoin]} 提现 ${withdrawAmount ?? withdrawAmountTo} 成功` : `${withdrawCoinMap[withdrawCoin]} 提现 ${withdrawAmount ?? withdrawAmountTo} 失败`;
  test(text, async () => {
    await withdraw(page, item);

    try{
      const exchangeResult = await page.waitForResponse(response => response.url().includes('/receipt/account/fiatWithdrawToBank') && response.status() === 200, {timeout: 3000});
      const exchangeResultJson:any = await exchangeResult.json();

      await expect(exchangeResultJson.success).toBe(isWithdrawSuccess);
    }catch(e){
      await page.waitForSelector('.app-btn-submit-lg');
      const errorText = await page.$eval('.app-btn-submit-lg', el => (el as HTMLElement).innerText);
      console.log(errorText);
      await expect(errorText).toBe('提现服务升级中，暂不支持提现');
    }
  }, 20000);
});