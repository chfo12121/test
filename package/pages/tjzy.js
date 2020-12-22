const app = getApp()
const typeConfig = {
    '1': {
        placeholder: '通知内容...',
        buttonText: '发布通知',
    },
    '2': {
        placeholder: '布置点好玩的作业呗',
        buttonText: '发布作业',
    },
    '3': {
        placeholder: '接龙内容...',
        buttonText: '发布接龙',
    },
}


Page({
    data: {
        images: [],
    },
    onLoad() {
        this.prevPage = getCurrentPages().reverse()[1]
        if (!wx.getStorageSync('my-name')) {
            wx.setStorage({
                key: 'my-name',
                data: app.nickName,
            })
        }
        this.text = wx.getStorageSync('tjzy') || ''
        this.setData({
            text: wx.getStorageSync('tjzy') || '',
            hasText: !!wx.getStorageSync('tjzy'),
            myName: wx.getStorageSync('my-name'),
        })
    },
    inputText(e) {
        wx.setStorage({
            key: 'tjzy',
            data: '',
        })
        this.text = e.detail.value
        this.setData({
            hasText: e.detail.value.length,
        })
    },
    chooseImage() {
        wx.chooseImage({
            count: 4 - this.data.images.length,
            sizeType: ['compressed'],
            success: (res) => {
                this.data.images = this.data.images.concat(res.tempFilePaths)
                this.setData({
                    images: this.data.images,
                })
            },
        })
    },
    removeImage(e) {
        this.data.images.splice(e.target.dataset['index'], 1)
        this.setData({
            images: this.data.images,
        })
    },
    previewImage(e) {
        wx.previewImage({
            current: e.target.dataset['img'],
            urls: this.data.images,
        })
    },
    bindinput(e) {
        wx.setStorage({
            key: 'my-name',
            data: e.detail.value,
        })
    },
    ok(e) {
        if (!e.detail.userInfo && !app.nickName) {
            return
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
        if (!this.data.hasText) {
            return
        }
        if (!wx.getStorageSync('my-name')) {
            return wx.showToast({
                title: '嗨，签个名呗~',
                icon: 'none',
            })
        }
        new Promise((resolve) => {
            wx.showModal({
                title: '嗨，仔细检查过了吗？',
                confirmColor: '#00a59a',
                success: (res) => {
                    if (res.confirm) {
                        resolve()
                    }
                },
            })
        }).then(() => {
            wx.showLoading()
            new Promise((resolve) => {
                if (this.data.images.length) {
                    resolve(
                        Promise.all(
                            this.data.images.map((image) => {
                                return new Promise((resolve) => {
                                    wx.uploadFile({
                                        url: 'https://up-z2.qbox.me',
                                        filePath: image,
                                        name: 'file',
                                        formData: {
                                            'token': app.upToken,
                                        },
                                        success: (res) => {
                                            resolve('http://xiaoboshi.xyuzhou.cn/' + JSON.parse(res.data).key)
                                        },
                                    })
                                })
                            })
                        )
                    )
                }
                else {
                    resolve([])
                }
            }).then((imageURLs) => {
                return new Promise((resolve) => {
                    wx.getShareInfo({
                        shareTicket: this.prevPage.shareTicket,
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
                    return new Promise((resolve) => {
                        console.log({
                            encryptedData: res.encryptedData,
                            iv: res.iv,
                            msgId: this.prevPage.msgId,
                            content: this.text,
                            picUrl: imageURLs.join(),
                        })
                        wx.request({
                            url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/joinSolitaire',
                            method: 'POST',
                            header: {
                                token: app.token,
                            },
                            data: {
                                encryptedData: res.encryptedData,
                                iv: res.iv,
                                msgId: this.prevPage.msgId,
                                content: this.text,
                                picUrl: imageURLs.join(),
                                userName: wx.getStorageSync('my-name') || '',
                            },
                            success: (res) => {
                                console.log(app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/joinSolitaire', res)
                                resolve(res.data.data.userId)
                            },
                        })
                    })
                })
            }).then((userId) => {
                getCurrentPages().reverse()[1].setData({
                    status: 1,
                })
                wx.redirectTo({
                    url: `zyxq?userId=${userId}`,
                })
            })
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
