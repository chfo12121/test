const app = getApp()

Page({
    onLoad() {
        app.gotToken.then(() => {
            if (!app.nickName) {
                wx.getUserInfo({
                    success(res) {
                        wx.request({
                            url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/updateUserInfo`,
                            method: 'POST',
                            header: {
                                token: app.token,
                            },
                            data: {
                                nickName: res.userInfo.nickName,
                                avatar: res.userInfo.avatarUrl,
                            },
                        })
                        wx.switchTab({
                            url: 'list',
                        })
                    },
                    fail: () => {
                        this.setData({
                            new: true,
                        })
                        wx.hideNavigationBarLoading()
                    },
                })
            }
            else {
                wx.switchTab({
                    url: 'list',
                })
            }
        })
    },
    bindgetuserinfo(e) {
        if (!e.detail.userInfo) {
            return
        }
        wx.request({
            url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/updateUserInfo`,
            method: 'POST',
            header: {
                token: app.token,
            },
            data: {
                nickName: e.detail.userInfo.nickName,
                avatar: e.detail.userInfo.avatarUrl,
            },
        })
        wx.switchTab({
            url: 'list',
        })
    },
    onShareAppMessage() {
        return {
            title: '发通知、接龙，提交作业，统计查阅名单，不刷屏！',
            path: `/pages/wx-info`,
            imageUrl: 'http://xiaoboshi.xyuzhou.cn/FsYVMBFxwAQceDKVOOdV7W6TDcTb',
        }
    },
})
