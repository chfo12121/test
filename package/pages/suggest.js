const app = getApp()


Page({
    onLoad() {

    },
    inputText(e) {
        this.text = e.detail.value
        this.setData({
            hasText: e.detail.value.length,
        })
    },
    ok() {
        if (!this.data.hasText) {
            return
        }
        wx.showLoading()
        wx.request({
            url: `${app.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/insertJudgment`,
            method: 'POST',
            header: {
                token: app.token,
            },
            data: {
                content: this.text,
            },
            success: (res) => {
                wx.showToast({
                    title: '感谢您真诚的意见，我们将及时受理~',
                    icon: 'none',
                })
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
