// pages/playList/playList.js
import request from "../../utils/request";
import PubSub from "pubsub-js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listImg: '', // 封面图片
    listDescribe: '', // 歌单描述
    playListSong: [], // 歌曲列表
    index: '', // 当前音乐下标
    musicId: '',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let playListId = options.id;
    this.getplayListDetail(playListId);

    // 订阅来自SongDetail页面发布的消息
    PubSub.subscribe('P_switchType', (msg, type) => {
      console.log(msg, type);
      let {
        playListSong,
        index
      } = this.data;
      console.log(playListSong, index);
      if (type === 'pre') { // 上一曲
        index -= 1;
        if (index < 0) {
          index = playListSong.length - 1;
        }
      } else { //下一曲
        index += 1;
        if (index == playListSong.length) {
          index = 0;
        }
      }
      // 更新音乐下标
      this.setData({
        index
      })
      console.log(playListSong[index]);
      let musicId = playListSong[index].id;
      // 将musicId回传给songDetail页面
      PubSub.publish('P_musicId', musicId);
    })
  },

  // 获取歌单详情
  async getplayListDetail(id) {
    let playListData = await request("/playlist/detail", { id });
    console.log(playListData);
    this.setData({
      listImg: playListData.playlist.coverImgUrl,
      listDescribe: playListData.playlist.name,
      playListSong: playListData.playlist.tracks
    })
  },

  // 
  toSongDatail(event) {
    console.log(event);
    let musicId = event.currentTarget.dataset.musicid;
    let index = event.currentTarget.dataset.index;
    this.setData({
      musicId,
      index
    })
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + musicId
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