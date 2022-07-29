const fs = require('fs')
const xlsx = require('node-xlsx')
const nodeExcel = require('excel-export')

// 读取Excel
const exceldata = xlsx.parse('assets/test.xlsx')[0]['data'];
const result = [];
for (let i = 1; i < exceldata.length; i++) {
  const row = exceldata[i];
  result.push({
    account: row[0],
    pwd: row[1],
    expectResult: row[2],
    type: row[3]
  })
  console.log(result)
}

type ExcelData = {
  name?: string,
  cols?: Object[],
  rows?: Object[],
}
/*
// 导出Excel
let conf: ExcelData = {} // excel配置
conf.name = 'sheet' //表格名
// 列名和类型
conf.cols = [
  {
    caption: '列名',
    type: 'string',
  },
  {
    caption: 'aaa',
    type: 'string'
  }
]

let excelData = new Array()
for (var i = 0; i < exportData.length; i++) {
  let arr = new Array()
  arr.push(exportData[i]);
  arr.push('7'.repeat(i))
  excelData.push(arr)
}
conf.rows = excelData
let result = nodeExcel.execute(conf)
let path = `assets/exportdata.xlsx`
fs.writeFile(path, result, 'binary', (err: Error) => {
  err ? console.log(err) : null
})*/