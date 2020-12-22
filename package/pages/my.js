const app = getApp()

Page({
    onLoad() {
        this.setData({
            nickName: app.nickName,
            avatar: app.avatar,
        })
    },
    toggle() {
        this.setData({
            see: !this.data.see,
        })
    },
    bindinput(e) {
        this.inputValue = e.detail.value
    },
    modify() {
        wx.navigateTo({
            url: 'modify-user-info',
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
