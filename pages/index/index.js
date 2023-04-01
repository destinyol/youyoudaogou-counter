// index.js
// 获取应用实例
import moment from '../../miniprogram_npm/moment/index';
import Notify from '@vant/weapp/notify/notify';
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
const app = getApp()
Page({
    data: {
        phoneNum: "",
        userName: "",
        loginCode: "",
        loginIned: false,
        token: app.globalData.token,
        walletMoney: 0, //钱包余额
        totalMoney: 0, //总市值
        totalCost: 0, //总成本

        requestIng: 0, //是否正在请求中  0是不在   1是在
        lastMoneyCheck: 0, //0是一样  1是涨  2是跌

        progress: 100, //进度条变量
        totalNum: 0, //总共多少件饰品

        lastMoney: { //上次市值相关数据
            totalMoney: -1,
            walletMoney: -1
        },

        timer: 0,
        itemList: [],
        lastItemList: [],
        waitingTempId: [],
        ignoreNum: 50,
        history: [],

        show: false, //历史记录弹出层控制变量
        showInfo: false, //使用说明弹出层变量
        showLogin: false, //登录弹窗

        columns: [{
            title: "总成本",
            key: "totalCost",
        }, {
            title: "总市值",
            key: "totalMoney",
        }, {
            title: "钱包余额",
            key: "walletMoney",
        }, {
            title: "已赚",
            key: "earnedMoney",
        }, {
            title: "日期",
            key: "time",
        }]
    },
    //退出登录确认弹窗
    loginOutConfirm() {
        let that = this
        Dialog.confirm({
                title: '登出确认',
                message: '退出登录后会清楚本地缓存历史记录，确认退出么？',
            })
            .then(() => {
                that.loginOut()
            })
            .catch(() => {
                // on cancel
            });
    },
    //退出登录
    loginOut() {
        let that = this
        that.setData({
            loginIned: false
        })
        that.setData({
            token: ""
        })
        app.globalData.token = ""
        that.setData({
            userName: ""
        })
        that.setData({
            phoneNum: ""
        })
        that.setData({
            itemList: []
        })
        that.setData({
            lastItemList: []
        })
        that.setData({
            lastItemList: []
        })
        that.setData({
            walletMoney: 0
        })
        that.setData({
            totalMoney: 0
        })
        that.setData({
            totalCost: 0
        })
        that.setData({
            history:[]
        })
        wx.clearStorage()
        Toast("登出成功");
    },
    //根据手机号获取验证码
    getLoginCode() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/user/Auth/SendSignInSmsCode',
            method: 'POST',
            data: {
                "Code": "",
                "Mobile": that.data.phoneNum,
                "RegTime": 0,
                "Sessionid": "0"
            },
            success(res) {
                console.log(res)
                if (res.data.Code != -1) {
                    Toast('发送成功');
                } else {
                    Toast(res.data.Msg);
                }
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //根据验证码效验登录
    checkLoginCode() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/user/Auth/SmsSignIn',
            method: 'POST',
            data: {
                "Code": that.data.loginCode,
                "Mobile": that.data.phoneNum,
                "Sessionid": "0"
            },
            success(res) {
                if (res.data.Code == 0) {
                    app.globalData.token = "Bearer " + res.data.Data.Token
                    wx.setStorage({
                        key: "token",
                        data: "Bearer " + res.data.Data.Token
                    })
                    wx.setStorage({
                        key: "phoneNum",
                        data: that.data.phoneNum
                    })
                    that.setData({
                        userName: res.data.Data.NickName
                    })
                    wx.setStorage({
                        key: "userName",
                        data: res.data.Data.NickName
                    })
                    that.setData({
                        loginIned: true
                    })
                    that.onLoginClose()
                    Toast("登录成功");
                } else {
                    Toast(res.data.Msg);
                }
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //历史记录弹出层弹出动作
    showPopup() {
        this.setData({
            show: true
        });
    },
    //历史记录弹出层关闭动作
    onClose() {
        this.setData({
            show: false
        });
    },
    //使用说明弹出层弹出动作
    showInfoPopup() {
        this.setData({
            showInfo: true
        });
    },
    //使用说明弹出层关闭动作
    onInfoClose() {
        this.setData({
            showInfo: false
        });
    },
    //登录弹出层弹出动作
    showLoginPopup() {
        this.setData({
            showLogin: true
        });
    },
    //登录说明弹出层关闭动作
    onLoginClose() {
        this.setData({
            showLogin: false
        });
    },
    onLoad() {
        let that = this
        wx.getStorage({
            key: 'token',
            success(res) {
                that.setData({
                    token: res.data
                })
                app.globalData.token = res.data
                if (res.data.length > 5) {
                    that.setData({
                        loginIned: true
                    })
                }
            }

        })
        wx.getStorage({
            key: 'userName',
            success(res) {
                that.setData({
                    userName: res.data
                })
            }
        })
        wx.getStorage({
            key: 'phoneNum',
            success(res) {
                that.setData({
                    phoneNum: res.data
                })
            }
        })
        wx.getStorage({
            key: 'totalCost',
            success(res) {
                that.setData({
                    totalCost: res.data
                })
            }
        })
        wx.getStorage({
            key: 'itemList',
            success(res) {
                that.setData({
                    itemList: res.data
                })
            }
        })
        wx.getStorage({
            key: 'totalMoney',
            success(res) {
                that.setData({
                    totalMoney: res.data
                })
            }
        })
        wx.getStorage({
            key: 'walletMoney',
            success(res) {
                that.setData({
                    walletMoney: res.data
                })
            }
        })
        wx.getStorage({
            key: 'ignoreNum',
            success(res) {
                that.setData({
                    ignoreNum: res.data
                })
            }
        })
        wx.getStorage({
            key: 'history',
            success(res) {
                that.setData({
                    history: res.data
                })
            }
        })
        wx.getStorage({
            key: 'lastMoneyCheck',
            success(res) {
                that.setData({
                    lastMoneyCheck: res.data
                })
            }
        })
    },
    GetCsGoPagedListLoopBegin() {
        let that = this
        that.setData({
            progress: 0
        })
        that.setData({
            totalNum: that.data.waitingTempId.length
        })
        this.data.timer = setInterval(this.GetCsGoPagedListLoop, 1200)
    },
    GetCsGoPagedListLoop() {
        let that = this

        if (that.data.waitingTempId.length > 0) {
            that.GetCsGoPagedList(that.data.waitingTempId.pop())
            that.setData({
                progress: Math.floor(((that.data.totalNum - that.data.waitingTempId.length) / that.data.totalNum) * 100)
            })
        } else {
            clearInterval(that.data.timer)
            wx.setStorage({
                key: "itemList",
                data: that.data.itemList
            })
            let nowTime = new Date()
            if (that.data.history.length > 250) {
                that.data.history.shift()
            }
            let item = {
                "walletMoney": that.data.walletMoney,
                "totalMoney": Math.floor(that.data.totalMoney * 100) / 100,
                "totalCost": that.data.totalCost,
                "earnedMoney": Math.floor((that.data.walletMoney + that.data.totalMoney - that.data.totalCost) * 100) / 100,
                "time": moment().format('YYYY-MM-DD')
            }
            if (that.data.history.length == 0) {
                that.data.history.push(item)
            } else {
                let passDate = that.data.history[that.data.history.length - 1].time.split("-")
                if (nowTime.getFullYear() == parseInt(passDate[0]) && (nowTime.getMonth() + 1) == parseInt(passDate[1]) && nowTime.getDate() == parseInt(passDate[2])) {
                    that.data.history.pop()
                    that.data.history.push(item)
                } else {
                    that.data.history.push(item)
                }
            }
            wx.setStorage({
                key: "history",
                data: that.data.history
            })
            that.setData({
                history: that.data.history
            })
            that.setData({
                requestIng: 0
            })
            console.log(that.data.history)
        }
    },
    //获取饰品市场价格
    GetCsGoPagedList(templateId) {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/homepage/es/commodity/GetCsGoPagedList',
            data: {
                "hasLease": "true",
                "haveBuZhangType": 0,
                "listSortType": "1",
                "listType": 40,
                "pageIndex": 1,
                "pageSize": 1,
                "sortType": "1",
                "status": "20",
                "templateId": templateId
            },
            method: 'POST',
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                let upOrDown = 0 //0是一样  1是涨   2是跌
                for (let index = 0; index < that.data.lastItemList.length; index++) {
                    if (that.data.lastItemList[index].name === res.data.Data.CommodityList[0].CommodityName) {
                        if (res.data.Data.CommodityList[0].Price > that.data.lastItemList[index].price) {
                            upOrDown = 1
                        } else if (res.data.Data.CommodityList[0].Price < that.data.lastItemList[index].price) {
                            upOrDown = 2
                        } else {
                            upOrDown = 0
                        }
                    }
                }
                that.data.itemList.push({
                    name: res.data.Data.CommodityList[0].CommodityName,
                    price: res.data.Data.CommodityList[0].Price,
                    label: "在售" + res.data.Data.TemplateInfo.OnSaleCount + "件 - 在出租" + res.data.Data.TemplateInfo.OnLeaseCount + "件",
                    upOrDown: upOrDown
                })
                that.setData({
                    itemList: that.data.itemList
                })
                let step = parseFloat(that.data.totalMoney)
                step = step + parseFloat(res.data.Data.CommodityList[0].Price)
                that.setData({
                    totalMoney: step
                })
                wx.setStorage({
                    key: "totalMoney",
                    data: step
                })
                if ((that.data.totalMoney + that.data.walletMoney) > (that.data.lastMoney.totalMoney + that.data.lastMoney.walletMoney)) {
                    that.setData({
                        lastMoneyCheck: 1
                    })
                    wx.setStorage({
                        key: "lastMoneyCheck",
                        data: 1
                    })
                } else if ((that.data.totalMoney + that.data.walletMoney) < (that.data.lastMoney.totalMoney + that.data.lastMoney.walletMoney)) {
                    that.setData({
                        lastMoneyCheck: 2
                    })
                    wx.setStorage({
                        key: "lastMoneyCheck",
                        data: 2
                    })
                } else {
                    that.setData({
                        lastMoneyCheck: 0
                    })
                    wx.setStorage({
                        key: "lastMoneyCheck",
                        data: 0
                    })
                }
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },

    onChangeTotalCost(event) {
        this.setData({
            totalCost: event.detail
        })
        wx.setStorage({
            key: "totalCost",
            data: event.detail
        })
    },
    onChangeIgnoreNum(event) {
        this.setData({
            ignoreNum: event.detail
        })
        wx.setStorage({
            key: "ignoreNum",
            data: event.detail
        })
    },

    //初始化token按钮
    initToken() {
        let that = this
        that.setData({
            requestIng: 1
        })
        that.setData({
            lastMoney: {
                totalMoney: that.data.totalMoney,
                walletMoney: that.data.walletMoney
            }
        })
        let step = []
        that.setData({
            lastItemList: step.concat(that.data.itemList)
        })
        that.setData({
            totalMoney: 0
        })
        that.setData({
            itemList: []
        })
        that.getUserInventoryDataList()
        that.GetSellAndLeaseListForUser()
        that.GetUserInventoryCoolingList()
        that.getUserInfo()
        that.getRentedList()
        that.GetCsGoPagedListLoopBegin()
    },
    //获取出售中、出租中的饰品
    GetSellAndLeaseListForUser() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/commodity/commodity/GetSellAndLeaseListForUser?SortType=0&Type=1&PageSize=1000&PageIndex=1',
            method: 'GET',
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                for (let index = 0; index < res.data.Data.Commoditys.length; index++) {
                    if (res.data.Data.Commoditys[index].MarkPrice > parseFloat(that.data.ignoreNum)) {
                        that.data.waitingTempId.push(res.data.Data.Commoditys[index].TemplateId)
                    }
                }
                that.setData({
                    totalNum: that.data.waitingTempId.length
                })
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //获取个人库存
    getUserInventoryDataList() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/commodity/Inventory/GetUserInventoryDataList?IsRefresh=false&PageSize=1000&Sort=0&PageIndex=1&CommodityTemplateId=0',
            method: 'GET',
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                for (let index = 0; index < res.data.Data.ItemsInfos.length; index++) {
                    if (res.data.Data.ItemsInfos[index].TemplateInfo.MarkPrice > parseFloat(that.data.ignoreNum)) {
                        that.data.waitingTempId.push(res.data.Data.ItemsInfos[index].TemplateInfo.Id)
                    }
                }
                that.setData({
                    totalNum: that.data.waitingTempId.length
                })
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //获取冷却中的饰品
    GetUserInventoryCoolingList() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/commodity/inventory/GetUserInventoryCoolingList?ItemStatus=0&PageSize=1000&IsRefresh=false&Sort=0&PageIndex=1',
            method: 'GET',
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                console.log(res)
                for (let index = 0; index < res.data.Data.ItemsInfos.length; index++) {
                    if (res.data.Data.ItemsInfos[index].TemplateInfo.MarkPrice > parseFloat(that.data.ignoreNum)) {
                        that.data.waitingTempId.push(res.data.Data.ItemsInfos[index].TemplateInfo.Id)
                    }
                }
                that.setData({
                    totalNum: that.data.waitingTempId.length
                })
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //获取个人信息
    getUserInfo() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/user/Account/getUserInfo',
            method: 'GET',
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                that.setData({
                    walletMoney: parseFloat(res.data.Data.TotalMoney)
                })
                wx.setStorage({
                    key: "walletMoney",
                    data: parseFloat(res.data.Data.TotalMoney)
                })
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //获取已租出的饰品
    getRentedList() {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/youpin/bff/commodity/rented-list',
            method: 'POST',
            data: {
                "pageIndex": "1",
                "timeSort": "DESC",
                "pageSize": "1000",
                "commodityName": ""
            },
            header: {
                'authorization': app.globalData.token,
                'AppType': 1
            },
            success(res) {
                for (let index = 0; index < res.data.data.contents.length; index++) {
                    that.getCommodityDetail(res.data.data.contents[index].commodityInfo.commodityId)
                }
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    //通过已租出饰品的commodityId换取templateId
    getCommodityDetail(commodityId) {
        let that = this
        wx.request({
            url: 'https://api.youpin898.com/api/commodity/Commodity/Detail?Id=' + commodityId,
            method: 'GET',
            success(res) {
                that.data.waitingTempId.push(res.data.Data.TemplateId)
                that.setData({
                    totalNum: that.data.waitingTempId.length
                })
            },
            fail(res) {
                Notify({
                    type: 'danger',
                    message: '请求失败'
                });
            }
        })
    },
    handleTcp() {
        const tcp = wx.createTCPSocket()
        tcp.connect({
            address: '59.82.113.18',
            port: 443
        })
        tcp.onConnect(() => {
            console.log("onConnect")
            tcp.write('hello, how are you')
        })
        tcp.onMessage((message, remoteInfo, localInfo) => {
            console.log("onMessage")
            console.log(message)
            console.log(remoteInfo)
            console.log(localInfo)
        })
        tcp.onError((res) => {
            console.log(res)
        })

        setTimeout(function () {
            // 3s后，关闭socket
            tcp.close(() => {
                console.log("close")
            })
        }, 3000)
    }
})