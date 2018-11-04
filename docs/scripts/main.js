(function() {
  var navbarHeight = document.querySelector('.main-navbar').offsetHeight

  function scrollWithOffset() {
    var targetElement = document.querySelector(':target')
    window.scroll({top: targetElement.offsetTop - navbarHeight})
  }

  window.addEventListener('hashchange', scrollWithOffset, false)
  window.addEventListener('DOMContentLoaded', scrollWithOffset, false)

  document.getElementById('show-menu').checked = false
}())
