// pages/songDetail/songDetail.js
import request from "../../utils/request";
import PubSub from 'pubsub-js';
import dayjs from "dayjs";
// 获取到小程序全局唯一的 App 实例。
var appInstance = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 标识音乐是否播放
    songDetail: {}, // 音乐详情对象
    musicId: '', //音乐ID
    musicLink: '', //当前音乐的播放链接
    currentTime: "00:00", //标识歌曲当前时长
    durationTime: "00:00", //标识音乐总时长
    currentWidth: 0, //实时进度条的宽度
    lyric: [], //歌词对象
    lyricTime: 0, //歌词对应的时间
    currentLyric: '', //当前时间的歌词
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    // options 用于接收路由跳转的query参数
    let musicId = options.musicId
    console.log('musicId:', musicId);
    console.log(appInstance.globalData)
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getSongDetail(musicId);

    // 获取歌词
    this.getLyric(musicId);

    // 创建控制音乐播放的实例,直接添加作为this的属性，解决跨作用域的问题
    this.backgroundAudioManager = wx.getBackgroundAudioManager();

    // 判断当前页面音乐是否在播放
    console.log(appInstance.globalData.isMusicPlay, appInstance.globalData.musicId, musicId);
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId == musicId) {
      console.log('音乐正在播放');
      this.setData({
        isPlay: true
      })

      // 监听背景音频的实时播放进度
      // this.handleCurrentWidth();
    }


    /*  * 问题： 如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决方案：
     *   1. 通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停 */

    // 监听背景音频的播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      console.log('play()');
      // 修改播放标识
      this.changePlayState(true);
      // 修改全局音乐id标识
      if (appInstance.globalData.musicId == '') {
        appInstance.globalData.musicId = musicId;
      }
    })
    this.backgroundAudioManager.onPause(() => {
      console.log('pause()');
      this.changePlayState(false);
    })
    this.backgroundAudioManager.onStop(() => {
      console.log('stop()', "播放结束");
      this.changePlayState(false);
    })

    // 监听音乐自然播放结束
    this.backgroundAudioManager.onEnded(() => {

      // 自动切换到下一曲
      this.judgePage('next');
      console.log('自动切换到下一曲');
      // 将实时进度条长度还原为0，时间还原为0
      this.setData({
        currentWidth: 0,
        currentTime: "00:00",
        lyric: [],
        lyricTime: 0,
        currentLyric: ''
      })
    })

    // 监听背景音频的实时播放进度
    this.backgroundAudioManager.onTimeUpdate(() => {

      //获取歌词对应时间
      let lyricTime = Math.ceil(this.backgroundAudioManager.currentTime);

      let dTime = this.backgroundAudioManager.duration; // 获取背景音频总时长  （单位为秒）
      let cTime = this.backgroundAudioManager.currentTime; //获取背景音频实时进度
      // 格式化音频实时进度事件
      let currentTime = dayjs(cTime * 1000).format("mm:ss");

      // currentWidth = 实时进度时间 / 总时长 * 总进度条长度（450）
      let currentWidth = cTime / dTime * 450;

      //  判断音乐是否在播放，播放再去更新进度条，解决进度条重复出现的问题
      if (this.data.isPlay) {
        this.setData({
          currentTime,
          currentWidth,
          lyricTime
        })
        this.getCurrentLyric();
      }
    })


  },

  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局音乐播放标识
    appInstance.globalData.isMusicPlay = isPlay;
  },

  // 点击音乐播放/暂停 的回调函数
  handleMusicPlay() {
    console.log('点击了播放/暂停');
    let pages = getCurrentPages();
    appInstance.globalData.listPage = pages[pages.length - 2];
    console.log(appInstance.globalData.listPage);
    let isPlay = !this.data.isPlay;
    // this.setData({
    //   isPlay
    // })
    let {
      musicId,
      musicLink
    } = this.data;
    this.musicControl(isPlay, musicId, musicLink);

  },

  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) { // 播放音乐

      // 性能优化，如果还是当前音乐，就不用一直请求
      if (!musicLink) {
        // 获取当前音乐的播放链接
        let musicLinkData = await request('/song/url', {
          id: musicId
        });
        musicLink = musicLinkData.data[0].url;
        this.setData({
          musicLink
        })
      }
      if (musicLink) {
        // 设置音频播放链接（必填）
        this.backgroundAudioManager.src = musicLink;
        // 音频标题， 用于原生音频播放器音频标题（ 必填）
        this.backgroundAudioManager.title = this.data.songDetail.name;
      } else {
        console.log('请开通会员听');
        wx.showToast({
          title: "请开通会员后听取",
          icon: "none"
        })
      }

    } else { //暂停音乐
      this.backgroundAudioManager.pause()
    }

  },

  // 通过id获取音乐详情的功能函数
  async getSongDetail(musicId) {
    let songDetail = await request('/song/detail', {
      ids: musicId
    });
    // 获取歌曲总时长 songDetail.songs[0].dt 单位毫秒
    let durationTime = dayjs(songDetail.songs[0].dt).format("mm:ss");
    console.log('歌曲时长：', durationTime);

    this.setData({
      songDetail: songDetail.songs[0],
      durationTime
    })

    // 获取当前页面栈。数组中第一个元素为首页，最后一个元素为当前页面。
    let pages = getCurrentPages();
    console.log(pages);
    let currentPage = pages[pages.length - 1].route;
    if (currentPage == 'pages/songDetail/songDetail') {
      // 动态修改页面的标题
      wx.setNavigationBarTitle({
        title: this.data.songDetail.name
      })
    }

  },

  // 点击切换音乐的回调函数
  handleSwitch(event) {
    let type = event.currentTarget.id;
    console.log(type);
    this.setData({
      currentWidth: 0,
      currentTime: "00:00",
      currentLyric: ''
    })

    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    this.judgePage(type);
  },

  // 实现发布订阅的功能函数
  handlePubSub(type) {
    // 订阅来自recommendSong页面发布的musicId
    PubSub.subscribe('musicId', (msg, musicId) => {
      console.log(musicId);
      // 修改全局音乐id标识
      appInstance.globalData.musicId = musicId;

      // 再重新获取音乐详情信息
      this.getSongDetail(musicId);

      // 自动播放音乐
      this.musicControl(true, musicId)

      // 重新获取歌词
      this.getLyric(musicId);

      // 取消订阅
      PubSub.unsubscribe('musicId');
    })

    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
  },

  // 
  handlePubSub1(type) {
    // 订阅来自playList页面发布的musicId
    PubSub.subscribe('P_musicId', (msg, musicId) => {
      console.log(musicId);
      // 修改全局音乐id标识
      appInstance.globalData.musicId = musicId;

      // 再重新获取音乐详情信息
      this.getSongDetail(musicId);

      // 自动播放音乐
      this.musicControl(true, musicId)

      // 重新获取歌词
      this.getLyric(musicId);

      // 取消订阅
      PubSub.unsubscribe('P_musicId');
    })

    // 发布消息数据给playList页面
    PubSub.publish('P_switchType', type)
  },

  // 判断是哪个页面的歌单
  judgePage(type) {
   /*  let pages = getCurrentPages();
    console.log(pages); */
    if (appInstance.globalData.listPage.route == "pages/recommendSong/recommendSong") {
      this.handlePubSub(type);
    } else if (appInstance.globalData.listPage.route == 'pages/playList/playList') {
      this.handlePubSub1(type);
    }
  },













































  //获取歌词
  async getLyric(musicId) {
    let lyricData = await request("/lyric", {
      id: musicId
    });
    this.formatLyric(lyricData.lrc.lyric);
  },

  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本是换好行的，直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]"); //通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach(element => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":"); //先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        obj.text = text;
        result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
      });
    }
    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
  },
  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
  },

  //控制歌词播放
  getCurrentLyric() {
    for (let i = 0; i < this.data.lyric.length; i++) {
      if (this.data.lyricTime == this.data.lyric[i].time) {
        this.setData({
          currentLyric: this.data.lyric[i].text
        })
      }
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