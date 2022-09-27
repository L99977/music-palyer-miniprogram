// pages/index/index.js
// 导入 request 方法
import request from "../../utils/request";
let appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendList: [], //推荐歌单
    topList: [],  // 排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let bannerListData = await request('/banner', {
      type: 2
    });
    console.log(bannerListData);
    this.setData({
      bannerList: bannerListData.banners
    })

    // 获取推荐歌单数据
    let recommendListData = await request('/personalized', {
      limit: 10
    });
    this.setData({
      recommendList: recommendListData.result
    })

    // 获取排行榜数据
    let resultArr = [];
    let index = 0;
    while (index < 5) {
      let topListData = await request('/top/list', { idx: index++ });
      let topListItem = {
        name: topListData.playlist.name,
        tracks: topListData.playlist.tracks.slice(0, 3)
      }
      resultArr.push(topListItem);
      // 不需要等待五次请求全部完成后才更新，用户体验较好，但是渲染次数会多一些
      this.setData({
        topList: resultArr
      })
    }
    /* 
    发送请求的过程中页面长时间白屏，用户体验差
    this.setData({
      topList: resultArr
    })

    */
    

  },

  // 跳转到每日推荐歌单页面
  toRecommendSong() {
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong'
    })
  },

  // 点击跳转到songDetail页面
  toSongDatail(event) {
    console.log(appInstance);
    appInstance.toSongDatail(event);
    /* let musicId = event.currentTarget.id;
    console.log('当前音乐id为：', musicId);
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + musicId
    }) */
  },

  // 点击跳转到歌单详情
  toPlayList(event) {
    console.log(event, event.currentTarget.id);
    let playListId = event.currentTarget.id;
    wx.navigateTo({
      url: "/pages/playList/playList?id=" + playListId
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