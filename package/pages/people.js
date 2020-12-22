const app = getApp()

Page({
    onLoad(options) {
        wx.showShareMenu({withShareTicket: true,})
        this.prevPage = getCurrentPages().reverse()[1]
        wx.setNavigationBarTitle({
            title: {
                '1': '通知',
                '2': '提交人员',
                '3': '接龙人员',
            }[this.prevPage.type],
        })
        this.msgId = this.prevPage.msgId
        this.kemu = this.prevPage.data.courseName
        this.setData({
            item: this.prevPage.data.groupList[options.index],
        })
    },
    viewReply(e) {
        if (this.prevPage.type == 2) {
            wx.navigateTo({
                url: `zyxq?userId=${e.currentTarget.dataset['userId']}`,
            })
        }
    },
    onShareAppMessage() {
        return {
            title: '【接龙名单】',
            path: `/pages/detail?msgId=${this.prevPage.msgId}&from=share`,
            imageUrl: 'http://xiaoboshi.xyuzhou.cn/FkfcIhAtnuY_ndGqw-Yk4wNcHuR5',
        }
    },
})
