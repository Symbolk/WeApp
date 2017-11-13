//index.js
//获取应用实例
var util = require('../../utils/util.js');
var app = getApp();
Page({
  data: {
    starsList: {},
    top3Stars: [],
    otherStars: [],
    defaultLoadContent: '数据已经全部加载完成.',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // 页面配置  
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 1,
    categoryIndex: 0,
    categories: ["全部", "男明星", "女明星"]
  },

  onLoad: function () {
    // get userinfo
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

   // get sys info
    var that = this;
    // 获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });

    // get all stars
    var that = this;
    that.getAllStars(function (data) {
      var top3Stars = data.slice(0, 3);
      var otherStars = data.slice(3);
      that.setData({
        starsList: data,
        top3Stars: top3Stars,
        otherStars: otherStars
      });
    });   
  },
  // api operations
  getAllStars: function (cal) {
    wx.request({
      url: 'https://toupaiyule.com/stars/getAllStars',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // console.log(res.data);
        // if (res && res.statusCode == 200 && res.data && res.data.code == 0) {
          if (typeof cal == 'function') {
            cal(res.data.data);
          }
        // } else {
          // console.log('请求失败');
        // }
      }
    });
  },
  init: function(){
    wx.request({
      url: 'https://toupaiyule.com/stars/init',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res.msg);
      }
    });
  },
  flowerStar: function(event){
    console.log(event.currentTarget.dataset.name);
    wx.request({
      url: 'https://toupaiyule.com/stars/flowerStar', 
      data: {
        starname: event.currentTarget.dataset.name
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' 
      },
      success: function (res) {
        console.log(res);
      }
    });
  },
  unflowerStar: function (event) {
    wx.request({
      url: 'https://toupaiyule.com/stars/unflowerStar',
      data: {
        starname: event.currentTarget.dataset.name
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res);
      }
    });
  },

  //下拉刷新
  onPullDownRefresh: function () {
    this.pullUpdateFlowerRankList();
  },
  pullUpdateFlowerRankList: function () {
    var that = this;
    wx.showNavigationBarLoading();
      that.getAllStars(function (data) {
        var top3Stars = data.slice(0, 3);
        var otherStars = data.slice(3);
        that.setData({
          starsList: data,
          top3Stars: top3Stars,
          otherStars: otherStars
        });
      wx.stopPullDownRefresh();
      setTimeout(function () {
        wx.hideNavigationBarLoading();
      }, 1000);
    });
  },
  //上滑加载更多
  // onReachBottom: function (e) {
  //   var that = this;
  //   var mainRankList = that.data.mainRankList;
  //   var updateFlowerData = that.data.flowerData;
  //   if (updateFlowerData.has_more == 0) {
  //     console.log("已经没有更多数据.");
  //   } else {
  //     that.loadMoreRankInfo(function (data) {
  //       //
  //       var newmainRankList = mainRankList.concat(data.flower_list);

  //       updateFlowerData['last_id'] = data.last_id;
  //       updateFlowerData['has_more'] = data.has_more;
  //       that.setData({
  //         mainRankList: newmainRankList,
  //         flowerData: updateFlowerData
  //       });
  //     });
  //   }
  // },
  loadMoreRankInfo: function (cal) {
    var that = this;
    util.JFrequest({
      url: 'https://t.superabc.cn/c/os/reading/getflowerranklist',
      param: {
        last_id: that.data.flowerData.last_id
      },
      success: function (res) {
        if (res && res.statusCode == 200 && res.data && res.data.code == 0) {
          if (typeof cal == 'function') {
            cal(res.data.data);
          }
        } else {
          console.log("请求数据失败，读取缓存");
          //
        }
      }
    });
  },


  // get user info
  bindPickerChange: function (e) {
    this.setData({
      categoryIndex: e.detail.value
    })
  },
  // handle swiper
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  // 点击tab切换 
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
});
