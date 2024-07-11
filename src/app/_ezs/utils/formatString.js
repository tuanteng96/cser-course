export const formatString = {
  getLastFirst: (text) => {
    if (!text) return
    const arrText = text.split(' ')
    if (arrText.length > 1) {
      return arrText[0].charAt(0) + arrText[arrText.length - 1].charAt(0)
    }
    return arrText[0].charAt(0)
  },
  formatVND: (price) => {
    if (!price || price === 0) {
      return '0'
    } else {
      return price.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  formatVNDPositive: (price) => {
    if (!price || price === 0) {
      return '0'
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  formatValueVoucher: (price) => {
    if (!price || price === 0) {
      return '0'
    } else if (Math.abs(price) <= 100) {
      return `${price}%`
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  fixedContentDomain: (content) => {
    if (!content) return ''
    return content.replace(
      /src="\//g,
      'src="' +
        (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? process.env.REACT_APP_API_URL : '') +
        '/'
    )
  }
}
