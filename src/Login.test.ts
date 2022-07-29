// const {loginFunc} = require('./utils/login')
import { Page } from 'puppeteer';
import { loginFunc } from './utils/login';
const fs = require('fs')
const xlsx = require('node-xlsx')

let loginTestData: LoginTestDataUnit[] = [];

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

beforeAll(async () => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  const exceldata = xlsx.parse('assets/test.xlsx')[0]['data'];
  console.log(exceldata);
  for (let i = 1; i < exceldata.length; i++) {
    const row = exceldata[i];
    loginTestData.push({
      account: row[0],
      pwd: row[1],
      expectResult: row[2],
      type: row[3]
    })
    console.log(row)
  }
});

const testLogin = (item: LoginTestDataUnit, page: Page) => {
  const { account, pwd, expectResult, type } = item;
  type === 0 ?
    it('正确登录', async () => {
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
    it('密码错误登录', async () => {
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
})

// describe('Onpay Login And Logout', () => {
//   it('should be titled "OnPay"', async () => {
//     await expect(page.title()).resolves.toMatch('OnPay');
//   });

//   it('正确退出', async () => {
//     await page.waitForSelector('span.ant-dropdown-trigger');
//     await page.hover('span.ant-dropdown-trigger');
//     await page.waitForSelector('span.ant-dropdown-menu-title-content > span.anticon-logout');
//     await page.$eval('span.ant-dropdown-menu-title-content > span.anticon-logout', el => {
//       (el as HTMLElement).click();
//     });
//     await page.waitForNavigation();
//     const pathName = await page.evaluate(() => {
//       return window.location.pathname;
//     });
//     expect(pathName).toMatch('/user/login');
//     await page.waitForTimeout(2000);
//   })
// });