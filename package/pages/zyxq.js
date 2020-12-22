const app = getApp()

Page({
    onLoad(options) {
        this.userId = options.userId
        wx.hideShareMenu()
        console.log('shareticket', app.shareTicket)
        this.detail = getCurrentPages().reverse()[1]
        this.shareTicket = app.shareTicket
        app.shareTicket = false
        this.type = 2
        this.msgId = options.msgId
        wx.setNavigationBarTitle({
            title: `${this.detail.kemu}作业`,
        })
        wx.showNavigationBarLoading()
        wx.showShareMenu({withShareTicket: true,})
        app.gotToken.then((token) => {
            wx.request({
                url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findReplyWorkByAuthor`,
                data: {
                    msgId: this.detail.msgId,
                    userId: options.userId,
                },
                header: {
                    token: app.token,
                },
                success: (res) => {
                    console.log({
                        msgId: this.detail.msgId,
                        userId: options.userId,
                    })
                    console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findReplyWorkByAuthor`, res)
                    wx.hideNavigationBarLoading()
                    res.data.data.createTime = new Date(res.data.data.createTime)
                    res.data.data.createTime = `${res.data.data.createTime.getFullYear()}-${res.data.data.createTime.getMonth() + 1}-${res.data.data.createTime.getDate()}`
                    this.setData({
                        avatar: res.data.data.avatar,
                        authorName: res.data.data.userName || app.nickName,
                        text: res.data.data.content,
                        images: res.data.data.picUrl && res.data.data.picUrl.split(',') || [],
                        createTime: res.data.data.createTime,
                        ready: true,
                    })
                },
            })
        })
    },
    previewImage(e) {
        wx.previewImage({
            current: e.target.dataset['img'],
            urls: this.data.images,
        })
    },
    bindinput(e) {
        this.userName = e.detail.value
    },
    commit(e) {
        if (this.data.status === 1) {
            return
        }
        if (!e.detail.userInfo) {
            return
        }
        if (!this.userName) {
            return wx.showToast({
                title: '嗨，别忘记留名喽！',
                icon: 'none',
            })
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
            success: (res) => {
                console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/updateUserInfo`, res)
            },
        })
        wx.showLoading()
        new Promise((resolve) => {
            wx.getShareInfo({
                shareTicket: this.shareTicket,
                success(res) {
                    resolve(res)
                },
            })
        }).then((res) => {
            console.log(res)
            wx.request({
                url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/joinSolitaire`,
                method: 'POST',
                header: {
                    token: app.token,
                },
                data: {
                    msgId: this.msgId,
                    encryptedData: res.encryptedData,
                    iv: res.iv,
                    userName: this.userName,
                },
                success: (res) => {
                    console.log({
                        msgId: this.msgId,
                        encryptedData: res.encryptedData,
                        iv: res.iv,
                        userName: this.userName,
                    })
                    console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/joinSolitaire`, res)
                    this.data.groupList = this.data.groupList || []
                    this.data.groupList[0] = this.data.groupList[0] || {}
                    this.data.groupList[0].userInfo = this.data.groupList[0].userInfo || []
                    this.data.groupList[0].userInfo.push({
                        avatar: e.detail.userInfo.avatarUrl,
                        nickname: e.detail.userInfo.nickName,
                        userName: this.userName,
                    })
                    this.setData({
                        text: res.data.data.content,
                        images: res.data.data.picUrls,
                        status: 1,
                        groupList: this.data.groupList,
                    })
                    wx.hideLoading()
                },
            })
        })
    },
    delete(e) {
        wx.request({
            url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/logicDeleteMsgHome',
            header: {
                token: app.token,
            },
            data: {
                msgId: this.msgId,
            },
            success: (res) => {
                console.log(res)
            },
        })
        wx.reLaunch({url: 'list'})
    },
    onShareAppMessage() {
        return {
            title: `【${{
                '1': '通知',
                '2': '作业',
                '3': '接龙',
            }[this.type]}】${this.detail.data.text}`,
            path: `/pages/detail?msgId=${this.msgId}&from=share`,
            imageUrl: {
                '1': 'http://xiaoboshi.xyuzhou.cn/FtYwnvwahP4Cx2ctfpd4fRR9xBl4',
                '2': 'http://xiaoboshi.xyuzhou.cn/FvUskld5gTJlBZgvLPfNDUfdox1G',
                '3': 'http://xiaoboshi.xyuzhou.cn/FkfcIhAtnuY_ndGqw-Yk4wNcHuR5',
            }[this.type],
        }
    },
})
