App({

  globalData: {
    isMusicPlay: false,  //标识是否有音乐播放
    musicId: '', //标识音乐id
    listPage: '', //标识歌单是哪个页面
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    
  },
    // 点击跳转到songDetail页面
    toSongDatail(event) {
      let musicId = event.currentTarget.id;
      console.log('当前音乐id为：', musicId);
      wx.navigateTo({
        url: '/pages/songDetail/songDetail?musicId=' + musicId
      })
    },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
