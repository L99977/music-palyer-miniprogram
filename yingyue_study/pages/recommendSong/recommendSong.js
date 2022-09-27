import request from '../../utils/request'
import PubSub from 'pubsub-js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    mounth: '',
    recommendList: [], // 每日推荐歌曲列表
    index: '', //音乐下标
    musicId: '' // 当前播放音乐的id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad');
    // 首先判断用户是否登录
    let userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      this.setData({
        recommendList: [],
      })
      /*  wx.showToast({
         title: '请先登录',
         icon: 'none',
         success: () => {
           wx.navigateTo({
             url: '/pages/login/login'
           })
         }
       }) */
      wx.showModal({
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
    }

    // 更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      mounth: new Date().getMonth() + 1
    })

    // 获取推荐歌曲数据列表
    this.getRecommendList();

    // 订阅来自SongDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      console.log(msg, type);
      let {
        recommendList,
        index
      } = this.data;
      if (type === 'pre') { // 上一曲
        index -= 1;
        if (index < 0) {
          index = recommendList.length - 1;
        }
      } else { //下一曲
        index += 1;
        if (index == recommendList.length) {
          index = 0;
        }
      }
      // 更新音乐下标
      this.setData({
        index
      })

      console.log(recommendList[index]);
      let musicId = recommendList[index].id;
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId);
    })
  },

  // 获取用户每日推荐歌单的回调函数
  async getRecommendList() {
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend
    })
  },

  // 点击跳转至songDetail页面
  toSongDetail(event) {
    let musicId = event.currentTarget.dataset.musicid;
    let index = event.currentTarget.dataset.index;
    this.setData({
      index,
      musicId
    })
    // 路由跳转传参， query参数
    wx.navigateTo({
      // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会被自动截取掉
      // url: '/pages/songDetail/songDetail?song='+JSON.stringify(song)
      url: '/pages/songDetail/songDetail?musicId=' + this.data.musicId
    })
  },

  // 判断用户是否登录
  isLogin() {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow');
    // 首先判断用户是否登录
    let userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      this.setData({
        recommendList: [],
      })
    }
    // 获取推荐歌曲数据列表
    this.getRecommendList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload');
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