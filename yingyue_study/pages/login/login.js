// pages/login/login.js
import request from '../../utils/request.js'
/**
   登录流程：
   1.收集表单项数据
   2.前端验证 
     1) 验证用户信息（账号、密码）是否合法
     2) 前端验证不通过就提示用户，不需要发送请求给后端
     3) 前端验证通过了，就发送请求（携带账号、密码）给服务端
    3.后端验证
      1) 验证用户是否存在
      2) 用户不存在则直接返回，提示前端用户不存在
      3) 用户存在则需要验证密码是否正确
      4) 密码不正确则提示前端密码不正确
      5) 密码正确则提示前端用户登录成功（并携带用户相关信息）
 */


Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "", //手机号
    password: "", //密码

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  handleInput(event) {
    console.log(event, event.detail.value);
    let type = event.target.id;
    console.log(type);
    this.setData({
      [type]: event.detail.value,
    })
  },
  async login() {
    let {
      phone,
      password
    } = this.data;
    // 前端验证
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空！',
        icon: 'none'
      })
      return;
    }
    let phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: "手机号格式错误",
        icon: "none"
      })
      return;
    }
    if (!password) {
      wx.showToast({
        title: "密码不能为空！",
        icon: "none"
      })
      return;
    }

    // 后端验证
    let result = await request('/login/cellphone', {
      phone,
      password,
      isLogin: true
    });
    console.log(result)
    if (result.code === 200) {
      wx.showToast({
        title: "登录成功！",
        // icon: "none" 
      })
      // 将用户信息存储到本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile));
      // 登录成功后跳转到个人中心页面
     /*  wx.reLaunch({
        url: '/pages/personal/personal'
      }) */
      wx.navigateBack();
    } else if (result.code === 502) {
      wx.showToast({
        title: "密码错误！",
        icon: "none"
      })
    } else if (result.code === 501) {
      wx.showToast({
        title: "账号不存在！",
        icon: "none"
      })
    } else {
      wx.showToast({
        title: '登录失败！'
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})