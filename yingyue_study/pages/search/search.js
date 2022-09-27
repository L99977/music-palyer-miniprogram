import request from '../../utils/request'
let time = false; // 函数节流使用
let appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder的内容
    hotList: [], // 热搜列表
    searchContent: '', // 用户输入的表单项数据
    searchList: [], // 关键字模糊匹配的数据
    historyList: [], // 历史搜索记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取初始化数据
    this.getInitData();

    // 获取本地搜索历史记录
    this.getHistoryList();
  },

  // 获取初始化的数据
  async getInitData() {
    // 获取placeholder的内容
    let {
      data
    } = await request('/search/default');
    console.log(data);
    // 获取热搜榜的数据
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: data.showKeyword,
      hotList: hotListData.data
    })

  },

  // 表单项内容发生改变的回调
  handleInputChange(event) {
    // 获取表单项数据
    // console.log(event.detail.value);
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if (time) {
      return;
    }

    time = true;
    // 节流
    setTimeout(() => {
      this.getSearchListData();
      time = false;
    }, 300)

  },

  //  获取 searchList 的数据
  async getSearchListData() {
    if (!this.data.searchContent) {
      this.setData({
        searchList: []
      })
      return;
    }
    let {
      searchContent,
      historyList
    } = this.data;
    let searchListData = await request("/search", {
      keywords: searchContent,
      limit: 10
    })
    this.setData({
      searchList: searchListData.result.songs
    })

    // 将搜索的关键字添加到历史搜索记录中
    if (historyList.includes(searchContent)) {
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList
    })
    // 将历史历史搜索记录存到本地
    wx.setStorageSync("historyList", historyList);
  },

  // 获取本地历史记录的功能函数
  getHistoryList() {
    let historyList = wx.getStorageSync("historyList");
    if (historyList) {
       this.setData({
         historyList
       })
    }
   
  },

  // 点击 X 号清空搜索内容
  clearSearchContent() {
    this.setData({
      searchContent: "",
      searchList: []
    })
    console.log("点击了X");
  },

  // 取消搜索
  cancleSearch() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 删除历史记录
  deleteHistoryList() {
    wx.showModal({
      content: '是否确认删除？',
      success:(res)=> {
        if (res.confirm) {
          console.log('用户点击确定')
          // 重置historyList
          this.setData({
            historyList: []
          })
          // 清除本地缓存中的historyList
          wx.removeStorageSync("historyList");
          
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },


  // 点击到歌曲播放页面
  toSongDetail(event) {
    /* let musicId = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId=' + musicId
    }) */
    appInstance.toSongDatail(event);
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