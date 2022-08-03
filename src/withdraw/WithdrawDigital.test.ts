import { loginFunc } from "../utils/login";
import { Page } from "puppeteer";

type WithdrawDigital = {
  // USDT 0 USDC 1 CNHC 2
  withdrawType: number,
  // ERC20 0 TRC20 1
  chainType: number,
  withdrawAmount: string,
  receiveAddress: string,
  pwd: string,
  expectResult: 0 | 1,
}

// number string Map
type nsMap = {
  [key: number]: string 
}

const withdrawCoinMap:nsMap = {
  0: 'USDT',
  1: 'USDC',
  2: 'CNH'
}

const withdrawDigitalData: WithdrawDigital[] = [
  // USDT 'TAaijyZPcMkW9uRJdx2Uxb3pASpJDbqth2' '123456'
  {
    withdrawType: 0,
    chainType: 1,
    withdrawAmount: '10',
    receiveAddress: 'TAaijyZPcMkW9uRJdx2Uxb3pASpJDbqth2',
    pwd: '123456',
    expectResult: 0,
  },
  // USDC '0x2748aE2Baa06Ff00F2bdFfa9FADddC2106d79071' '123456'
  {
    withdrawType: 1,
    chainType: 0,
    withdrawAmount: '5',
    receiveAddress: '0x2748aE2Baa06Ff00F2bdFfa9FADddC2106d79071',
    pwd: '123456',
    expectResult: 0,
  },
  {
    withdrawType: 1,
    chainType: 0,
    withdrawAmount: '10',
    receiveAddress: '0x2748aE2Baa06Ff00F2bdFfa9FADddC2106d79071',
    pwd: '123459',
    expectResult: 1,
  },
]

beforeAll(async() => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await loginFunc(page);
})

beforeEach(async () => {
  await page.goto('http://localhost:8001/WithdrawalManagement/Withdrawal');
})

const withdrawDigital = async(page: Page, data: WithdrawDigital) => {
  const { withdrawType, chainType, withdrawAmount, receiveAddress, pwd } = data;

  await page.waitForResponse(res => res.url().includes('/receipt/account/getAccountInfo') && res.status() === 200); 

  await page.waitForSelector('#basic_fiat')
  await page.waitForTimeout(1000);
  await page.click('#basic_fiat')
  await page.waitForTimeout(1500);
  for(let i = 0; i < withdrawType; i++) {
    await page.keyboard.press('ArrowDown');
  }
  await page.keyboard.press('Enter')

  await page.waitForResponse(res => res.url().includes('/receipt/account/getDigitalWithdrawConfig') && res.status() === 200); 

  await page.keyboard.press('Tab')

  // 根据withdrawAccountType选择提现账户类型
  if (chainType === 1) {
    await page.keyboard.press('ArrowRight');
  }

  // '#basic_withdrawalNumber' 提币数量
  await page.keyboard.press('Tab')
  await page.keyboard.type(withdrawAmount)

  // '#basic_address' 接收地址
  await page.keyboard.press('Tab')
  await page.keyboard.type(receiveAddress)

  // '#basic_password' 支付密码
  await page.keyboard.press('Tab')
  await page.keyboard.type(pwd)

  await page.waitForSelector('.ant-form-item-control-input-content > .app-btn-submit-lg')
  await page.click('.ant-form-item-control-input-content > .app-btn-submit-lg')
}

describe.each(withdrawDigitalData)(`数字货币提币`, (data) => {
  const { withdrawType, withdrawAmount, expectResult } = data;
  const isWithdrawSuccess = expectResult === 0;
  const text = isWithdrawSuccess ? `${withdrawCoinMap[withdrawType]} 提现 ${withdrawAmount} 成功` : `${withdrawCoinMap[withdrawType]} 提现 ${withdrawAmount} 失败`;
  test(text, async () => {
    await withdrawDigital(page, data);
    // get '/receipt/account/fiatWithdrawToBank' response
    const response = await page.waitForResponse(response => response.url().includes('/receipt/account/digitalWithdraw') && response.status() === 200);
    const resJson:any = await response.json();
    // console.log(resJson)
    expect(resJson.success).toBe(isWithdrawSuccess);
  }, 60000);
})