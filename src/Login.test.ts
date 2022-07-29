// const {loginFunc} = require('./utils/login')
import { Page } from 'puppeteer';
import { loginFunc } from './utils/login';
// const fs = require('fs')
const xlsx = require('node-xlsx')

let loginTestData: LoginTestDataUnit[] = 
[{
  account: 'faqob@dropjar.com',
  pwd: 'Xyc980830',
  expectResult: '🎉 🎉 🎉 登录成功！',
  type: 0
},
{
  account: 'faqob@dropjar.com',
  pwd: 'Xyc980831',
  expectResult: '账号或密码错误',
  type: 1
},
{
  account: 'sawuhuw@givmail.com',
  pwd: '1123456',
  expectResult: '账号或密码错误',
  type: 1
},
{
  account: 'sawuhuw@givmail.com',
  pwd: '2123456',
  expectResult: '账号或密码错误',
  type: 1
},
{
  account: 'sawuhuw@givmail.com',
  pwd: '123456',
  expectResult: '🎉 🎉 🎉 登录成功！',
  type: 0
}];

type LoginTestDataUnit = {
  account: string,
  pwd: string,
  expectResult: string,
  type: 0 | 1
}

type JsonResponse = {
  status: number,
  success: boolean
};

const readExcel = async () => {
  const exceldata = xlsx.parse('assets/test.xlsx')[0]['data'];
  console.log(exceldata);
  const result = [];
  for (let i = 1; i < exceldata.length; i++) {
    const row = exceldata[i];
    result.push({
      account: row[0],
      pwd: row[1].toString(),
      expectResult: row[2],
      type: row[3]
    })
  }
  return result;
}

beforeAll(async () => {
  // loginTestData = await readExcel();
  // await page.waitForTimeout(5000)
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
});

const testLogin = (item: LoginTestDataUnit, page: Page) => {
  const { account, pwd, expectResult, type } = item;
  type === 0 ?
    test('正确登录', async () => {
      let toastText;
      await loginFunc(page, account, pwd);
      await page.waitForResponse(response => response.url().includes('/receipt/login/login') && response.status() === 200);
      // const jsonRes = (await response.json()) as JsonResponse;
      await page.waitForNavigation();
      toastText = await page.$eval('div > .ant-message > div > .ant-message-notice > .ant-message-notice-content > div > span:nth-child(2)', el => (el as HTMLElement).innerText);
      // expect to be“🎉 🎉 🎉 登录成功！”
      expect(toastText).toMatch(expectResult);
    })
    :
    test('密码错误登录', async () => {
      let toastText;
      await loginFunc(page, account, pwd);
      await page.waitForResponse(response => response.url().includes('/receipt/login/login') && response.status() === 200);
      // const jsonRes = (await response.json()) as JsonResponse;
      toastText = await page.$eval('div > .ant-message > div > .ant-message-notice > .ant-message-notice-content > div > span:nth-child(2)', el => (el as HTMLElement).innerText);
      expect(toastText).toMatch(expectResult);
    });
}


describe.each(loginTestData)('($variable.account)测试登录', (item: LoginTestDataUnit) => {
  testLogin(item, page);
},10000)

describe.skip('Onpay Login And Logout', () => {
  it('should be titled "OnPay"', async () => {
    await expect(page.title()).resolves.toMatch('OnPay');
  });

  it('正确退出', async () => {
    await page.waitForSelector('span.ant-dropdown-trigger');
    await page.hover('span.ant-dropdown-trigger');
    await page.waitForSelector('span.ant-dropdown-menu-title-content > span.anticon-logout');
    await page.$eval('span.ant-dropdown-menu-title-content > span.anticon-logout', el => {
      (el as HTMLElement).click();
    });
    await page.waitForNavigation();
    const pathName = await page.evaluate(() => {
      return window.location.pathname;
    });
    expect(pathName).toMatch('/user/login');
    await page.waitForTimeout(2000);
  })
});