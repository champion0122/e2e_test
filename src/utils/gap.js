
// 计算登录滑块的移动距离
const calcGapPosition = async (page, src) => {
  const distance = await page.evaluate(async (src) => {
      // 获取次数最多的值
      const findMost2 = (arr) => {
          var h = {};
          var maxNum = 0;
          var maxEle = null;
          for (var i = 0; i < arr.length; i++) {
              var a = arr[i];
              h[a] === undefined ? h[a] = 1 : (h[a]++);
              if (h[a] > maxNum) {
                  maxEle = a;
                  maxNum = h[a];
              }
          }
          return {
              times: maxNum,
              value: maxEle
          }
      }
      // 图片加载
      const imageLoaded = (document, src) => {
          return new Promise((r, j) => {
              const image = document.createElement('img')
              image.setAttribute('src', src)
              image.crossOrigin = "Anonymous";
              image.addEventListener('load', () => {
                  r(image)
              })
              image.addEventListener('error', () => {
                  j()
              })
          })
      }
      const image = await imageLoaded(document, src).catch(err => {
          console.log('图片加载失败')
      })
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      const imageInfo = ctx.getImageData(0, 0, image.width, image.height)
      const imageData = imageInfo.data;
      const gap = 1;
      let positionX = []
      for (var h = 0; h < image.height; h += gap) {
          for (var w = 0; w < image.width; w += gap) {
              var position = (image.width * h + w) * 4;
              var r = imageData[position], g = imageData[position + 1], b = imageData[position + 2];
              let num = 0;
              if (r >= 252) num += 1;
              if (g >= 252) num += 1;
              if (b >= 252) num += 1;
              if (num >= 2) {
                  positionX.push(w)
              }
          }
      }
      return findMost2(positionX)
  }, src)
  return distance.value * 340 / 552
}

module.exports = calcGapPosition
