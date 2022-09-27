// 发送ajax请求
/* 
   封装功能函数
   1.功能点明确
   2.函数内部应该保留固定代码（静态的）
   3.将动态的数据抽取成形参，由使用者根据自身的情况动态的传入实参
   4.一个良好的功能函数应该设置形参的默认值（ES6语法形参默认值）
*/
import config from "./config";
export default (url, data = {}, method = 'get') => {
  return new Promise((resolve, reject) => {
    wx.request({
      // url: config.mobileHost + url,
      url: config.host + url,
      data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        console.log('请求成功：', res);
        if (data.isLogin) { //登录请求
          // 将用户的cookie存入至本地
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        resolve(res.data) // 修改promise的状态为成功状态 resolved
      },
      fail: (err) => {
        console.log('请求失败：', err);
        reject(err) // 修改promise的状态为失败状态 rejected
      }
    })
  })

}