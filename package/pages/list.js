const app = getApp()

Page({
    onLoad() {
        wx.showNavigationBarLoading()
        app.gotToken.then((token) => {
            wx.request({
                url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findHistoryMsgInfo`,
                header: {
                    token,
                },
                success: (res) => {
                    console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findHistoryMsgInfo`, res)
                    res.data.data.records.forEach((v) => {
                        v.createTime = new Date(v.createTime)
                        if (
                            v.createTime.getFullYear() === new Date().getFullYear() &&
                            v.createTime.getMonth() === new Date().getMonth() &&
                            v.createTime.getDate() === new Date().getDate()
                        ) {
                            v.createTime = `今天 ${v.createTime.getHours()}:${v.createTime.getMinutes()}`
                        }
                        else {
                            v.createTime = `${v.createTime.getFullYear()}-${v.createTime.getMonth() + 1}-${v.createTime.getDate()}`
                        }
                    })
                    this.setData({
                        messages: res.data.data.records,
                        nickName: app.nickName,
                        ready: true,
                    })
                    wx.hideNavigationBarLoading()
                },
            })
        })
    },
    viewDetail(e) {
        wx.navigateTo({
            url: `detail?msgId=${e.currentTarget.dataset['msgId']}`,
        })
    },
    delete(e) {
        wx.request({
            url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/logicDeleteMsgHome',
            header: {
                token: app.token,
            },
            data: {
                msgId: this.data.messages[e.currentTarget.dataset['index']].msgHomId,
            },
            success: (res) => {
                console.log(res)
            },
        })
        this.data.messages.splice(e.currentTarget.dataset['index'], 1)
        this.setData({
            messages: this.data.messages,
        })
    },
    toggle(e) {
        new Promise((resolve) => {
            return resolve()
            if (e.detail.userInfo) {
                resolve()
                if (!app.nickName) {
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
                }
            }
        }).then(() => {
            this.setData({
                open: !this.data.open,
            })
        })
    },
    create(e) {
        setTimeout(() => {
            this.setData({
                open: false,
            })
        }, 111)
        wx.navigateTo({
            url: `produce?type=${e.currentTarget.dataset['type']}`,
        })
    },
    onPullDownRefresh() {
        wx.request({
            url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/findHistoryMsgInfo',
            header: {
                token: app.token,
            },
            success: (res) => {
                console.log(res)
                res.data.data.records.forEach((v) => {
                    v.createTime = new Date(v.createTime)
                    if (
                        v.createTime.getFullYear() === new Date().getFullYear() &&
                        v.createTime.getMonth() === new Date().getMonth() &&
                        v.createTime.getDate() === new Date().getDate()
                    ) {
                        v.createTime = `今天 ${v.createTime.getHours()}:${v.createTime.getMinutes() + 1}`
                    }
                    else {
                        v.createTime = `${v.createTime.getFullYear()}-${v.createTime.getMonth() + 1}-${v.createTime.getDate()}`
                    }
                })
                this.setData({
                    messages: res.data.data.records,
                })
                wx.stopPullDownRefresh()
            },
        })
    },
    onShareAppMessage() {
        return {
            title: '发通知、接龙，提交作业，统计查阅名单，不刷屏！',
            path: `/pages/list`,
            imageUrl: 'http://xiaoboshi.xyuzhou.cn/FkfcIhAtnuY_ndGqw-Yk4wNcHuR5',
        }
    },
})
