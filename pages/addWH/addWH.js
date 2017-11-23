
Page({
  data:{
    newWH_name: ''
  },
  newWHName: function(e){
    this.setData({
     newWH_name: e.detail.value
    });
  },
  checkExists:function(e){
    if (this.data.newWH_name.length == 0) {
      wx.showToast({
        title: '请先输入网红名',
        icon: 'success',
        duration: 2000
      });
    }else{
      wx.request({
        url: 'https://toupaiyule.com/wanghong/exists/' + app.globalData.newWH_name,
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if(res.data.exists){
            
          }else{

          }
        }
      });
    }
  }
})