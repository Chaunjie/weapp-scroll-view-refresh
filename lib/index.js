Component({
  data: {
    scrollY: true,
    touchYDelta: '',
    isLoading: false,
    loadWrapH: '',
    winfactor: 0.2,
    translateVal: '',
    isMoved: false,
    firstTouchY: '',
    initialScroll: '',
    friction: 2.5,
    scrollTop: 0,
    triggerDistance: 100,
    className: '',
    animationData: {},
    animation: {},
    system: '',
    brand: '',
    loader: {
      height: 500
    },
    time: '',
    text: '下拉可以刷新'
  },
  externalClasses: ['custom-class'],
  options: {
    multipleSlots: true
  },
  properties: {
    lowerThresHold: {
      type: Number,
      value: 50
    },
    scrollWithAnimation: {
      type: Boolean,
      value: false
    },
    enableBackToTop: {
      type: Boolean,
      value: false
    },
    scrollIntoView: {
      type: String,
      value: ''
    }
  },
  methods: {
    scroll (e) {
      this.setData({
        scrollTop: e.detail.scrollTop
      })
      this.triggerEvent('scroll', e.detail.scrollTop)
    },
    scrollToLower () {
      this.triggerEvent('lower')
    },
    touchstart (ev) {
      const {isLoading, scrollTop} = this.data
      if (isLoading) {
        return
      }
      const touchobj = ev.touches[0]
      this.setData({
        isMoved: false,
        sDuration: '0ms',
        touchYDelta: '',
        firstTouchY: parseInt(touchobj.clientY),
        initialScroll: scrollTop
      })
    },
    touchmove (ev) {
      const {isLoading} = this.data
      if (isLoading) {
        return
      }
      let touchobj = ev.touches[0]
      let touchY = parseInt(touchobj.clientY)
      let touchYDelta = touchY - this.data.firstTouchY
      if (this.data.initialScroll > 0 || this.data.scrollTop > 0 || this.data.scrollTop === 0 && touchYDelta < 0) {
        this.setData({
          firstTouchY: touchY
        })
        return
      }
      /* eslint-enable */
      const yDelta = this.data.brand === 'devtools' ? touchYDelta ** 0.85 : this.data.system === 'ios' ? touchYDelta ** 0.5 : touchYDelta ** 0.85
      // let translateVal = yDelta
      this.data.animation.translate3d(0, yDelta, 0).step()
      let obj = touchYDelta >= this.data.triggerDistance ? {
        className: 'refresh-pull-up', 
        // text: '松开可以刷新'
      } : {
        className: 'refresh-pull-down', 
        // text: '下拉可以刷新'
      }
      this.setData({
        touchYDelta: touchYDelta,
        animationData: this.data.animation.export(),
        isMoved: true,
        ...obj
      })
    },
    touchend (ev) {
      if (this.data.isLoading || !this.data.isMoved) {
        this.setData({
          isMoved: false
        })
        return
      }
      // 根据下拉高度判断是否加载
      if (this.data.touchYDelta >= this.data.triggerDistance) {
        this.data.animation.translate3d(0, this.data.loader.height, 0).step()
        this.setData({
          isLoading: true,
          scrollY: false,
          animationData: this.data.animation.export(),
          className: 'refreshing',
          text: '正在刷新...'
        })
        this.triggerEvent('refresh', 'success')
      } else {
        this.data.animation.translate3d(0, 0, 0).step({duration: 300})
        this.setData({
          animationData: this.data.animation.export()
        })
        // this.triggerEvent('refresh', 'error');
      }
      this.setData({
        isMoved: false
      })
    },
    reset () {
      this.setData({
        isLoading: false,
        scrollY: true,
        className: 'refresh-pull-up',
        text: '下拉可以刷新'
      }, () => {
        this.data.animation.translate3d(0, 0, 0).step({duration: 300})
        const time = this.getTime()
        this.setData({
          animationData: this.data.animation.export(),
          className: 'refresh-pull-down',
          time: time
        })
      })
    },
    throttle (fn, delay) {
      let allowSample = true
      return function(e) {
        if (allowSample) {
          allowSample = false
          setTimeout(function() { allowSample = true }, delay)
          fn(e)
        }
      }
    },
    getTime() {
      const date = new Date()
      return `${date.getFullYear()}-${this.getFriendlyTime(date.getMonth() + 1)}-${this.getFriendlyTime(date.getDate())} ${this.getFriendlyTime(date.getHours())}:${this.getFriendlyTime(date.getMinutes())}:${this.getFriendlyTime(date.getSeconds())}`
    },
    getFriendlyTime (time) {
      return time < 10 ? '0' + time : time
    },
    detached () {
      console.log(66666)
    }
  },
  ready () {
    let animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'linear'
    })
    let system = 'android'
    const systemInfo = wx.getSystemInfoSync()
    if (/iPhone/.test(systemInfo.model)) {
      system = 'ios'
    }
    const time = this.getTime()
    this.setData({
      time: time,
      system: system,
      animation: animation,
      brand: systemInfo.brand,
      animationData: animation.export()
    })
    wx.createSelectorQuery().in(this).selectAll('.refresh-load').boundingClientRect((res) => {
      if (res && res.length) {
        this.setData({
          loader: res[0]
        })
      }
    }).exec()
  }
})