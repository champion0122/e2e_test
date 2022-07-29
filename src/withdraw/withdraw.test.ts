// const {getIn} = require('../utils/login');
import { ElementHandle, Page } from 'puppeteer';
import {getIn} from '../utils/login';

const withdraw = async (page: Page) => {
  let pathName = await page.evaluate(() => {
    return window.location.pathname;
  });
  console.log(pathName);
  // while(pathName !== '/UserHome'){
  //   await getIn(page);
  //   pathName = await page.evaluate(() => {
  //     return window.location.pathname;
  //   });
  // }
  await page.waitForSelector('.ant-pro-sider-menu')

  await page.waitForSelector('[title=提现管理]')
  await page.click('[title=提现管理]')

  await page.waitForSelector('.ant-menu-submenu')
  await page.waitForTimeout(1000);
  await page.click('[title=提现]')
  
  // await page.waitForNavigation();
  
  await page.waitForSelector('.ant-form-item-control-input-content > #basic_withdrawType > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  await page.click('.ant-form-item-control-input-content > #basic_withdrawType > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  
  await page.click('.ant-form-item-control-input > .ant-form-item-control-input-content > #basic_tradeType > .ant-radio-wrapper:nth-child(2) > span:nth-child(2)')
  
  const uploaders:Array<ElementHandle> = await page.$$('.ant-upload > input');
  for(let i = 0; i < uploaders.length; i++){
    await uploaders[i].uploadFile('assets/lake.jpeg')
    await page.waitForTimeout(1500)
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
  await page.waitForSelector('#basic_fiat')
  await page.click('#basic_fiat')
  // 选中下拉框第二项
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter');
  
  // await page.waitForTimeout(1000);
  // await page.waitForSelector('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .ant-select-item-option-active > .ant-select-item-option-content')
  // await page.click('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .ant-select-item-option-active > .ant-select-item-option-content')

  await page.waitForSelector('.ant-form-item-control-input-content > #basic_isOnshore > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  await page.click('.ant-form-item-control-input-content > #basic_isOnshore > .ant-radio-wrapper:nth-child(2) > .ant-radio > .ant-radio-input')
  
  await page.waitForSelector('#basic_withdrawNumber')
  await page.click('#basic_withdrawNumber')
  
  await page.type('#basic_arriveAmount','12')
  
  await page.waitForSelector('#basic_account')
  await page.click('#basic_account')
  
  // 选择账号下拉框第一项
  await page.keyboard.press('Enter');
  // await page.waitForSelector('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .app-select-option-pre:nth-child(2) > .ant-select-item-option-content')
  // await page.click('.rc-virtual-list-holder > div > .rc-virtual-list-holder-inner > .app-select-option-pre:nth-child(2) > .ant-select-item-option-content')
  
  await page.type('#basic_password','Xyc980830')
  
  await page.type('#basic_toWithdrawalPostscript','testtesttesttesttesttesttest')
  
  // await page.type('#basic','testtesttesttest')
  
  await page.type('#basic_operationNote','testtesttesttest')
  
  await page.waitForSelector('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
  await page.click('.ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-btn > span')
}

beforeEach(async() => {
  await page.goto('http://localhost:8001');
  await page.waitForNavigation();
  await getIn(page);
})

describe('withdraw test', () => {
  it('withdraw submit', async () => {
    await withdraw(page);
    // get '/receipt/account/fiatWithdrawToBank' response
    const response = await page.waitForResponse(response => response.url().includes('/receipt/account/fiatWithdrawToBank') && response.status() === 200);
    const resJson:any = await response.json();
    expect(resJson.success).toBe(true);
  })
})