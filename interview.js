let anchors = document.querySelectorAll('a')

anchors.forEach(a => {
  let spanEle = document.createElement('span')
  spanEle.append(a)
  let parent = a.parentNode
  parent.replaceChild(spanEle, a)
})
