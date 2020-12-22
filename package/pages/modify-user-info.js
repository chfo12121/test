const app = getApp()


Page({
    onLoad() {
        this.setData({
            nickName: getCurrentPages().reverse()[1].data.nickName,
            hasText: !!getCurrentPages().reverse()[1].data.nickName,
        })
    },
    inputText(e) {
        this.inputValue = e.detail.value
        this.setData({
            hasText: e.detail.value.length,
        })
    },
    ok() {
        if (!this.data.hasText) {
            return
        }
        wx.request({
            url: app.APIPrefix + '/xiaoboshi_wx/weChat/v1/wx/updateUserInfo',
            method: 'POST',
            header: {
                token: app.token,
            },
            data: {
                nickName: this.inputValue || getCurrentPages().reverse()[1].data.nickName,
            },
            success: (res) => {
                console.log(res)
            },
        })
        getCurrentPages().reverse()[1].setData({
            nickName: this.inputValue || getCurrentPages().reverse()[1].data.nickName,
        })
        wx.navigateBack()
    },
    onShareAppMessage() {
        return {
            path: `/pages/list`,
            imageUrl: 'http://xiaoboshi.xyuzhou.cn/FkfcIhAtnuY_ndGqw-Yk4wNcHuR5',
        }
    },
})
