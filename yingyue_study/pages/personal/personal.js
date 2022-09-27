import request from '../../utils/request'

let startY = 0;  //手指的起始纵坐标
let moveY = 0;   // 手指移动的纵坐标
let moveDistance = 0; //手指移动的距离
let appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalTransform: "", // 移动效果
    coveTransition: "",  // 过渡动画
    userInfo: '',  // 用户信息
    recentPlayList: [],  //用户播放记录

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })

      // 获取用户的播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
    
  },
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(uid) {
    let recentPlayListData = await request('/user/record', {
      uid, type: 0
    })
    this.setData({
      recentPlayList: recentPlayListData.allData.splice(0, 10)
    })
  },

  handleTouchStart(event) {
    // 多个手指时，一般只去第一个
    startY = event.touches[0].clientY;  // 获取手指的起始纵坐标
    // 清除过渡效果
    this.setData({
      coveTransition: "",
    })
  },
  handleTouchMove(event) {
    moveY = event.touches[0].clientY;  // 获取手指滑动的纵坐标
    moveDistance = moveY - startY;
    if (moveDistance <0) {
      moveDistance = 0;
    }
    if (moveDistance > 80) {
      moveDistance = 80
    }
    this.setData({
      totalTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd() {
    // console.log('end');
    this.setData({
      totalTransform: `translateY(0rpx)`,
      coveTransition: 'all 1s linear'
    })
  },
  // 跳转到登录页面
  toLogin() {
    wx.navigateTo({
      url: "../login/login"
    })
  },

  toSongDetail(event) {
    console.log(appInstance);
    appInstance.toSongDatail(event);
  },

  // 退出登录
  quit() {
    wx.showModal({
      content: '是否确定退出登录',
      success: (res) => {
        if (res.confirm) {
          // 清空所有
          // wx.clearStorageSync();
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('cookies');
          this.setData({
            userInfo: '',
            recentPlayList: []
          })
        }
      }
    })
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