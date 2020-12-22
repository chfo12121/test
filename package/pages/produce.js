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
    onLoad(option) {
        this.type = option.type
        wx.setNavigationBarTitle({
            title: {
                '1': '通知',
                '2': '作业',
                '3': '接龙',
            }[option.type],
        })
        this.setData({
            iszuoye: option.type == 2,
            placeholder: typeConfig[this.type].placeholder,
            buttonText: typeConfig[this.type].buttonText,
            text: wx.getStorageSync('produce') || '',
            hasText: !!wx.getStorageSync('produce'),
            kemu: wx.getStorageSync('kemu'),
        })
        app.edit = {
            text: wx.getStorageSync('produce') || '',
            images: [],
        }
    },
    inputText(e) {
        wx.setStorage({
            key: 'produce',
            data: '',
        })
        app.edit.text = e.detail.value
        this.setData({
            hasText: app.edit.text.length,
        })
    },
    chooseImage() {
        wx.chooseImage({
            count: 4 - app.edit.images.length,
            sizeType: ['compressed'],
            success: (res) => {
                app.edit.images = app.edit.images.concat(res.tempFilePaths)
                this.setData({
                    images: app.edit.images,
                })
            },
        })
    },
    removeImage(e) {
        app.edit.images.splice(e.target.dataset['index'], 1)
        this.setData({
            images: app.edit.images,
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
            key: 'kemu',
            data: e.detail.value,
        })
    },
    checkbox(e) {
        console.log(e)
        if (e.detail.value.length) {
            this.isSubmit = 1
            this.setData({
                isSubmit: true,
            })
        }
        else {
            this.isSubmit = 0
            this.setData({
                isSubmit: false,
            })
        }
    },
    ok(e) {
        console.log(e.detail.userInfo.avatarUrl)
        console.log(e.detail.userInfo.nickName)
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
        if (this.type == 2 && !wx.getStorageSync('kemu')) {
            return wx.showToast({
                title: '嗨，别忘了设置科目哦~',
                icon: 'none',
            })
        }
        new Promise((resolve) => {
            wx.showModal({
                title: '嗨，确定发布吗',
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
                if (app.edit.images.length) {
                    resolve(Promise.all(app.edit.images.map((image) => {
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
                    })))
                }
                else {
                    resolve([])
                }
            }).then((imageURLs) => {
                return new Promise((resolve) => {
                    wx.request({
                        url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/insertMsgHomeByWx',
                        method: 'POST',
                        header: {
                            token: app.token,
                        },
                        data: {
                            type: this.type,
                            content: app.edit.text,
                            courseName: wx.getStorageSync('kemu') || '',
                            picUrl: imageURLs.join(),
                            isSubmit: this.isSubmit || 0,
                        },
                        success: (res) => {
                            resolve(res.data.data)
                        },
                    })
                })
            }).then((msgId) => {
                let prevPage = getCurrentPages().reverse()[1]
                prevPage.setData({
                    messages: [{
                        msgHomId: msgId,
                        type: this.type,
                        content: app.edit.text,
                        courseName: wx.getStorageSync('kemu'),
                        picUrl: app.edit.images,
                        createTime: `${new Date().getFullYear()}-${new Date().getMonth() + 1} - ${new Date().getDate()}`,
                    }].concat(prevPage.data.messages)
                })
                wx.redirectTo({
                    url: `detail?msgId=${msgId}`,
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
