const app = getApp()

Page({
    onLoad(options) {
        wx.hideShareMenu()
        console.log('shareticket', app.shareTicket)
        if (!wx.getStorageSync('my-name')) {
            wx.setStorage({
                key: 'my-name',
                data: app.nickName,
            })
        }
        this.shareTicket = app.shareTicket
        app.shareTicket = false
        this.msgId = options.msgId
        wx.showNavigationBarLoading()
        app.gotToken.then((token) => {
            wx.request({
                url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findMsgHomeById`,
                data: {
                    msgId: options.msgId,
                },
                header: {
                    token: app.token,
                },
                success: (res) => {
                    console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/findMsgHomeById`, res)
                    wx.hideNavigationBarLoading()
                    wx.showShareMenu({withShareTicket: true,})
                    console.log(res)
                    res.data.data.msgInfo.createTime = new Date(res.data.data.msgInfo.createTime)
                    res.data.data.msgInfo.createTime = `${res.data.data.msgInfo.createTime.getFullYear()}-${res.data.data.msgInfo.createTime.getMonth() + 1}-${res.data.data.msgInfo.createTime.getDate()}`
                    this.type = res.data.data.msgInfo.type
                    let shareText
                    if (res.data.data.msgInfo.type == 1) {
                        if (res.data.data.isAuthor) {
                            shareText = '发布通知'
                        }
                        else {
                            shareText = '分享'
                        }
                    }
                    if (res.data.data.msgInfo.type == 2) {
                        shareText = '确定发布'
                    }
                    if (res.data.data.msgInfo.type == 3) {
                        if (res.data.data.isAuthor) {
                            shareText = '邀请接龙'
                        }
                        else {
                            shareText = '分享邀请'
                        }
                    }
                    this.kemu = res.data.data.msgInfo.courseName || ''
                    this.setData({
                        type: res.data.data.msgInfo.type,
                        isSubmit: !!res.data.data.msgInfo.isSubmit,
                        avatar: res.data.data.msgInfo.avatar,
                        authorName: res.data.data.msgInfo.authorName,
                        text: res.data.data.msgInfo.content,
                        courseName: res.data.data.msgInfo.courseName || '',
                        kemu: res.data.data.msgInfo.courseName || '',
                        images: res.data.data.msgInfo.picUrl && res.data.data.msgInfo.picUrl.split(',') || [],
                        createTime: res.data.data.msgInfo.createTime,
                        groupList: res.data.data.msgInfo.groupList,
                        status: res.data.data.status,
                        userName: wx.getStorageSync('my-name') || app.nickName,
                        isAuthor: res.data.data.isAuthor,
                        ready: true,
                        fromGroup: !!this.shareTicket,
                        total: res.data.data.msgInfo.groupList.reduce((sum, group) => sum + group.userInfo.length, 0),
                        shareText,
                        haveName: !!app.nickName,
                    })
                    if (res.data.data.msgInfo.type == 3) {
                        wx.setNavigationBarTitle({
                            title: '接龙',
                        })
                    }
                    if (res.data.data.msgInfo.type == 2) {
                        wx.setNavigationBarTitle({
                            title: `${res.data.data.msgInfo.courseName}作业`,
                        })
                    }
                    if (res.data.data.msgInfo.type == 1) {
                        wx.setNavigationBarTitle({
                            title: '通知',
                        })
                        if (res.data.data.status === 1) {
                            return
                        }
                        new Promise((resolve) => {
                            wx.getShareInfo({
                                shareTicket: this.shareTicket,
                                success(res) {
                                    resolve(res)
                                },
                                fail() {
                                    resolve({
                                        encryptedData: '',
                                        iv: '',
                                    })
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
                                    userName: app.nickName,
                                },
                                success: (res) => {
                                    console.log(`${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/joinSolitaire`, res)
                                    this.data.groupList = this.data.groupList || []
                                    this.data.groupList[0] = this.data.groupList[0] || {}
                                    this.data.groupList[0].userInfo = this.data.groupList[0].userInfo || []
                                    this.data.groupList[0].userInfo.push({
                                        avatar: app.avatar,
                                        nickname: app.nickName,
                                        userName: app.nickName,
                                    })
                                    this.setData({
                                        status: 1,
                                        groupList: this.data.groupList,
                                    })
                                    wx.hideLoading()
                                },
                            })
                        })
                    }
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
    group(e) {
        if (this.data.isAuthor) {
            wx.navigateTo({
                url: `people?index=${e.currentTarget.dataset['index']}`,
            })
        }
    },
    bindinput(e) {
        wx.setStorage({
            key: 'my-name',
            data: e.detail.value,
        })
    },
    tjzy() {
        if (this.data.status === 1) {
            return
        }
        wx.navigateTo({
            url: 'tjzy',
        })
    },
    commit(e) {
        if (this.data.status === 1) {
            return
        }
        if (!e.detail.userInfo && !app.nickName) {
            return
        }
        if (!wx.getStorageSync('my-name')) {
            return wx.showToast({
                title: '嗨，别忘记留名喽！',
                icon: 'none',
            })
        }
        if (!app.nickName) {
            wx.request({
                url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/updateUserInfo',
                method: 'POST',
                header: {
                    token: app.token,
                },
                data: {
                    nickName: e.detail.userInfo.nickName,
                    avatar: e.detail.userInfo.avatarUrl,
                },
                success: (res) => {
                    console.log(res)
                },
            })
        }
        wx.showLoading()
        new Promise((resolve) => {
            wx.getShareInfo({
                shareTicket: this.shareTicket,
                success(res) {
                    resolve(res)
                },
                fail() {
                    resolve({
                        encryptedData: '',
                        iv: '',
                    })
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
                    userName: wx.getStorageSync('my-name'),
                },
                success: (res) => {
                    console.log('/xiaoboshi_wx/weChat/v1/wx/joinSolitaire', res)
                    this.data.groupList = this.data.groupList || []
                    this.data.groupList[0] = this.data.groupList[0] || {}
                    this.data.groupList[0].userInfo = this.data.groupList[0].userInfo || []
                    this.data.groupList[0].userInfo.push({
                        avatar: e.detail.userInfo.avatarUrl,
                        nickname: e.detail.userInfo.nickName,
                        userName: wx.getStorageSync('my-name'),
                    })
                    this.setData({
                        status: 1,
                        groupList: this.data.groupList,
                    })
                    wx.hideLoading()
                },
            })
        })
    },
    delete(e) {
        wx.showModal({
            title: '确定删除吗',
            confirmColor: '#00a59a',
            success: (res) => {
                if (res.confirm) {
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
                }
            },
        })
    },
    toggle() {
        this.setData({
            open: !this.data.open,
        })
    },
    onUnload() {
        wx.hideNavigationBarLoading()
    },
    onShareAppMessage() {
        return {
            title: `【${{
                '1': '通知',
                '2': '作业',
                '3': '接龙',
            }[this.type]}】${this.data.text}`,
            path: `/pages/detail?msgId=${this.msgId}&from=share`,
            imageUrl: this.data.images && this.data.images[0] || {
                '1': 'http://xiaoboshi.xyuzhou.cn/FtYwnvwahP4Cx2ctfpd4fRR9xBl4',
                '2': 'http://xiaoboshi.xyuzhou.cn/FvUskld5gTJlBZgvLPfNDUfdox1G',
                '3': 'http://xiaoboshi.xyuzhou.cn/FkfcIhAtnuY_ndGqw-Yk4wNcHuR5',
            }[this.type],
        }
    },
})
