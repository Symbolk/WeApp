//index.js
//获取应用实例
var util = require('../../utils/util.js');
var app = getApp();

// Array.prototype.contains = function (needle) {
//   for (let i in this) {
//     if (this[i] == needle) return true;
//   }
//   return false;
// }

var pageObject = {};
pageObject.data = {
  starsList: [],
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
  starCategories: ["全部", "男明星", "女明星"],
  starTypeIndex: 0,
  whCategories: ["全部", "男网红", "女网红"],  
  whTypeIndex: 0,
  floweredToday: ['gaga', '迪丽热巴'],
  allFloweredStars: ['关晓彤'],
  favstarIndex: 0,
  current: ''
};


pageObject.onLoad = function () {
  wx.showShareMenu({
    withShareTicket: true,
    success: function (res) {
      wx.showToast({
        title: '转发成功',
        icon: 'success',
        duration: 2000
      });
    },
    fail: function (res) {
      wx.showToast({
        title: '转发失败',
        image: '../images/error.png',
        icon: 'success',
        duration: 2000
      });
    }
  })
  
  // get userinfo
  if (app.globalData.userInfo) {
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    });
    this.checkUser(this.data.userInfo);
  } else if (this.data.canIUse) {
    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    // 所以此处加入 callback 以防止这种情况
    app.userInfoReadyCallback = res => {
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      });
      this.checkUser(this.data.userInfo);
    }
  } else {
    // 在没有 open-type=getUserInfo 版本的兼容处理
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        this.checkUser(this.data.userInfo);
      }
    });
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
};
// end onLoad

//页面事件
pageObject.onShareAppMessage = function(){
  return{
    title: '头牌娱乐小程序',
    path: '/pages/index/index',
    success: function(res){
      wx.showToast({
        title: '转发成功',
        icon: 'success',
        duration: 2000
      });
      // Get the share inticket
      wx.getShareInfo({
        shareTicket: res.shareTickets[0],
        success: function (res) { console.log(res) },
        fail: function (res) { console.log(res) }
      })
    },
    fail: function (res) {
      wx.showToast({
        title: '转发失败',
        image: '../images/error.png',
        icon: 'success',
        duration: 2000
      });
    }
  }
},

pageObject.getUserInfo = function (e) {
  app.globalData.userInfo = e.detail.userInfo;
  this.setData({
    userInfo: e.detail.userInfo,
    hasUserInfo: true
  });
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
};
// 滑动切换tab 
pageObject.bindChange = function (e) {
  var that = this;
  that.setData({ currentTab: e.detail.current });
};
// 点击tab切换 
pageObject.swichNav = function (e) {
  var that = this;
  if (this.data.currentTab === e.target.dataset.current) {
    return false;
  } else {
    that.setData({
      currentTab: e.target.dataset.current
    })
  }
};
// 下拉刷新
pageObject.onPullDownRefresh = function () {
  this.pullUpdateFlowerRankList();
};
pageObject.pullUpdateFlowerRankList = function () {
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
};
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
pageObject.loadMoreRankInfo = function (cal) {
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
};

// Get different type of stars with the picker
pageObject.starTypeChange = function (e) {
  this.setData({
    categoryIndex: e.detail.value
  });
  var that = this;
  if(e.detail.value==0){
    that.getAllStars(function (data) {
      var top3Stars = data.slice(0, 3);
      var otherStars = data.slice(3);
      that.setData({
        starsList: data,
        top3Stars: top3Stars,
        otherStars: otherStars
      });
    });
  }else if(e.detail.value==1){
    that.getMaleStars(function (data) {
      var top3Stars = data.slice(0, 3);
      var otherStars = data.slice(3);
      that.setData({
        starsList: data,
        top3Stars: top3Stars,
        otherStars: otherStars
      });
    });
  }else{
    that.getFemaleStars(function (data) {
      var top3Stars = data.slice(0, 3);
      var otherStars = data.slice(3);
      that.setData({
        starsList: data,
        top3Stars: top3Stars,
        otherStars: otherStars
      });
    });
  }
};


// STAR事件
// run after the user log in to the app
pageObject.unflowerStar = function (e) {
  var that=this;
  this.setData({
    current: e.currentTarget.dataset.name
  });
  wx.request({
    url: 'https://toupaiyule.com/stars/unflowerStar',
    data: {
      username: app.globalData.userInfo.nickName,
      starname: e.currentTarget.dataset.name
    },
    method: 'POST',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 2000
        });
      if (res.data.success) {
        that.pullUpdateFlowerRankList();
      }
    }
  });
},
  pageObject.flowerStar = function (e) {
    var that=this;
    this.setData({
      current: e.currentTarget.dataset.name
    });
    wx.request({
      url: 'https://toupaiyule.com/stars/flowerStar',
      data: {
        username: app.globalData.userInfo.nickName,
        starname: e.currentTarget.dataset.name
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1000
        });
        if (res.data.success) {
          that.pullUpdateFlowerRankList();
        }
      }
    });
  },

  pageObject.checkUser = function (userInfo) {
    wx.request({
      url: 'https://toupaiyule.com/users/exists/' + userInfo.nickName,
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (!res.data.exists) {
          // if not, create a user
          wx.request(
            {
              url: 'https://toupaiyule.com/users/createUser',
              method: 'POST',
              data: {
                username: userInfo.nickName,
                avatar: userInfo.avatarUrl
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.log(res.data.msg + userInfo.nickName);
              }
            });
        } else {
          // if yes, nothing
          wx.showToast({
            title: 'Welcome back!',
            icon: 'success',
            duration: 1000
          });
          console.log('Welcome back ' + userInfo.nickName);
        }
      }
    });
    // get flowered stars by the user
    // var that = this;
    // wx.request({
    //   url: 'https://toupaiyule.com/users/floweredToday/' + app.globalData.userInfo.nickName,
    //   method: 'GET',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   success: function (res) {
    //     let temp = new Array();
    //     for (let d of res.data) {
    //       temp.push(d.starname);
    //     }
    //     // that.setData({
    //     //   floweredToday: temp
    //     // });
    //     // add flowered flag for every star
    //     for (let s of that.data.top3Stars) {
    //       for (let fs of temp) {
    //         if (s.starname == fs) {
    //           s.floweredToday = true;
    //         }
    //       }
    //     }
    //     for (let s of that.data.otherStars) {
    //       for (let fs of temp) {
    //         if (s.starname == fs) {
    //           s.floweredToday = true;
    //         }
    //       }
    //     }
    //   }
    // });
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
  };
// api operations
pageObject.getAllStars = function (cal) {
  wx.request({
    url: 'https://toupaiyule.com/stars/getAllStars/' + app.globalData.userInfo.nickName,
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof cal == 'function') {
        cal(res.data.data);
      }
    }
  });
};
pageObject.getMaleStars = function (cal) {
  wx.request({
    url: 'https://toupaiyule.com/stars/getMaleStars/' + app.globalData.userInfo.nickName,
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof cal == 'function') {
        cal(res.data.data);
      }
    }
  });
}; 
pageObject.getFemaleStars = function (cal) {
  wx.request({
    url: 'https://toupaiyule.com/stars/getFemaleStars/' + app.globalData.userInfo.nickName,
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      if (typeof cal == 'function') {
        cal(res.data.data);
      }
    }
  });
};

pageObject.init = function () {
  wx.request({
    url: 'https://toupaiyule.com/stars/init',
    method: 'GET',
    header: {
      'content-type': 'application/json'
    },
    success: function (res) {
      console.log(res.data.msg);
    }
  });
}



// 网红事件
pageObject.addWH = function (e) {
  wx.navigateTo({
    url: '../addWH/addWH'
  });
};


Page(pageObject)