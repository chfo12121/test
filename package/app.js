App({
    onLaunch() {
        wx.showNavigationBarLoading()
        this.gotToken = new Promise((resolve) => {
            wx.login({
                success: (codeData) => {
                    resolve(codeData.code)
                },
            })
        }).then((js_code) => {
            return new Promise((resolve, reject) => {
                wx.request({
                    url: `${this.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/wxLogin`,
                    data: {
                        jscode: js_code,
                    },
                    success: (tokenData) => {
                        console.log(`${this.APIPrefix}/xiaoboshi_wx/weChat/v1/wx/wxLogin`, tokenData)
                        if (tokenData.data.code === 0) {
                            this.token = tokenData.data.data.token
                            this.nickName = tokenData.data.data.nickName
                            this.avatar = tokenData.data.data.avatar
                            this.upToken = tokenData.data.data.upToken
                            resolve(this.token)
                        }
                        else {
                            reject(tokenData.data.message)
                            wx.showToast({
                                title: tokenData.data.message,
                                icon: 'none',
                            })
                        }
                    },
                })
            })
        })
    },
    onShow(options) {
        this.shareTicket = options.shareTicket
    },
    APIPrefix: 'http://193.112.54.130:9999',
    APIPrefix: 'https://xyuzhou.cn:9991',
})