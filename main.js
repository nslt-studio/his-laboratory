// ============================================================
//  HIS LABORATORY — main.js
//  Ajouter les imports de nouveaux modules ici.
// ============================================================
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

// ----------------------------------------------------------
//  DEV LIVE RELOAD
//  Se connecte au serveur SSE via l'URL de ce script.
//  Abandonne après 5 échecs (= en production, pas de serveur).
// ----------------------------------------------------------
;(function () {
  var s = document.currentScript
  if (!s || !s.src) return
  var base = new URL(s.src).origin
  var v = null, retries = 0
  function connect() {
    var es = new EventSource(base + '/sse-reload')
    es.onmessage = function (e) {
      retries = 0
      if (v !== null && e.data !== v) location.reload()
      v = e.data
    }
    es.onerror = function () {
      es.close()
      if (++retries < 5) setTimeout(connect, 3000)
    }
  }
  connect()
})()

// ============================================================
//  APP
// ============================================================
gsap.registerPlugin(ScrollTrigger, CustomEase)
CustomEase.create('cbEase', '.7,0,.3,1')

var TRANS = { duration: 0.3, ease: 'power1.out' }

// ==========================================================
//  LENIS SMOOTH SCROLL
// ==========================================================
var lenis = new Lenis({
  smooth: true,
  syncTouch: true,
  smoothTouch: true,
  touchInertiaExponent: 1.9,
  syncTouchLerp: 0.04,
  lerp: 0.13,
})

window.lenis = lenis

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add(function (time) {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// ==========================================================
//  IMAGE PRELOADER
// ==========================================================
function initImagePreloader() {
  var fadeIn = function (img) {
    gsap.fromTo(
      img,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.out',
        onComplete: function () { img.classList.add('is-loaded') },
      }
    )
  }

  var handleImg = function (img) {
    if (!img.hasAttribute('data-preloader') || img.dataset.loaded) return
    img.dataset.loaded = '1'
    if (img.complete && img.naturalWidth > 0) {
      fadeIn(img)
    } else {
      img.addEventListener('load', function () { fadeIn(img) }, { once: true })
      img.addEventListener('error', function () { fadeIn(img) }, { once: true })
    }
  }

  document.querySelectorAll('img[data-preloader]').forEach(handleImg)

  new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes
      if (!added) continue
      for (var j = 0; j < added.length; j++) {
        var node = added[j]
        if (node.nodeType !== 1) continue
        if (node.matches && node.matches('img[data-preloader]')) handleImg(node)
        if (node.querySelectorAll) node.querySelectorAll('img[data-preloader]').forEach(handleImg)
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true })
}

initImagePreloader()

// ==========================================================
//  LOADER
// ==========================================================
var loaderWillPlay = false

function initLoader() {
  var loader = document.getElementById('loader-section')
  var mainW = document.querySelector('.main-w')
  var htmlEl = document.documentElement

  if (!loader || sessionStorage.getItem('loaderPlayed')) return

  var items = loader.querySelectorAll('.loader-collection-w .loader-item')
  if (!items.length) return

  loaderWillPlay = true
  lenis.scrollTo(0, { immediate: true })

  var prevBodyOverflow = document.body.style.overflow
  var prevHtmlOverflow = htmlEl.style.overflow
  document.body.style.overflow = 'hidden'
  htmlEl.style.overflow = 'hidden'
  lenis.stop()

  var randomIndex = Math.floor(Math.random() * items.length)
  items[randomIndex].classList.add('active')

  var handleExit = function () {
    loader.removeEventListener('click', handleExit)
    sessionStorage.setItem('loaderPlayed', 'true')
    lenis.scrollTo(0, { immediate: true })

    var vh = window.innerHeight
    var tl = gsap.timeline({ defaults: { duration: 0.9, ease: 'cbEase' } })

    tl.to(loader, { top: -vh, opacity: 0 }, 0)
    if (mainW) tl.fromTo(mainW, { top: vh, opacity: 0 }, { top: 0, opacity: 1 }, 0)
    tl.add(function () {
      loader.style.display = 'none'
      document.body.style.overflow = prevBodyOverflow
      htmlEl.style.overflow = prevHtmlOverflow
      lenis.start()
      htmlEl.classList.add('loader-played')
    })
  }

  loader.addEventListener('click', handleExit)
}

initLoader()

// ==========================================================
//  FORM BUTTONS — empêche les boutons sans type explicite
//  de soumettre le form (comportement navigateur par défaut)
// ==========================================================
function initFormButtons() {
  document.querySelectorAll('form button:not([type])').forEach(function (btn) {
    btn.setAttribute('type', 'button')
  })
}

// ==========================================================
//  FILE UPLOAD — corrige la boucle infinie Webflow/jQuery
//
//  La boucle a deux chemins :
//  A) jQuery propage son propre événement trigger jusqu'au label
//  B) jQuery appelle input.click() natif qui bulle vers le label
//
//  Fix A → handler jQuery sur l'input qui arrête la propagation jQuery
//  Fix B → listener natif sur l'input qui arrête le bubble DOM
// ==========================================================
function initFileUpload() {
  // Fix B — propagation DOM native
  document.querySelectorAll('input[type="file"]').forEach(function (input) {
    input.addEventListener('click', function (e) {
      e.stopPropagation()
    })
  })

  // Fix A — propagation interne jQuery
  var jq = window.jQuery
  if (!jq) return
  jq('input[type="file"]').on('click', function (e) {
    e.stopPropagation()
  })
}

// ==========================================================
//  VIEW BUTTONS (first / second)
// ==========================================================
function initViewButtons() {
  var buttons = document.querySelectorAll('.view-button[data-button]')
  if (!buttons.length) return

  var views = {
    first: document.querySelector('[data-view="first"]'),
    second: document.querySelector('[data-view="second"]'),
  }

  var tl = gsap.timeline({ paused: true })

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault()
      var target = btn.getAttribute('data-button')
      var currentBtn = document.querySelector('.view-button.active')
      if (!currentBtn) return

      var current = currentBtn.getAttribute('data-button')
      if (target === current) return

      buttons.forEach(function (b) {
        b.classList.remove('active')
        var sel = b.querySelector('.selector')
        if (sel) sel.classList.remove('active')
      })
      btn.classList.add('active')
      var sel = btn.querySelector('.selector')
      if (sel) sel.classList.add('active')

      var curView = views[current]
      var tgtView = views[target]
      if (!curView || !tgtView) return

      tl.kill()
      tl = gsap.timeline({ defaults: TRANS })
      tl.to(curView, { opacity: 0 })
        .set(curView, { display: 'none' })
        .set(tgtView, { display: 'block', opacity: 0 })
        .to(tgtView, { opacity: 1 })
    })
  })
}

// ==========================================================
//  NAVIGATION (data-link transitions)
// ==========================================================
function initNavigation(mainW) {
  var navLinks = document.querySelectorAll('[data-link]')
  if (!navLinks.length) return

  var isNavigating = false

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var clicked = e.currentTarget
      var targetVal = clicked.getAttribute('data-link')

      if (isNavigating) { e.preventDefault(); return }
      if (clicked.classList.contains('w--current')) return

      e.preventDefault()
      isNavigating = true

      var url = clicked.href

      navLinks.forEach(function (l) {
        l.classList.toggle('w--current', l.getAttribute('data-link') === targetVal)
      })

      gsap.to(mainW, {
        opacity: 0,
        duration: TRANS.duration,
        ease: TRANS.ease,
        onComplete: function () { window.location.href = url },
      })
    })
  })
}

// ==========================================================
//  PAGE: ABOUT
// ==========================================================
function initAboutPage() {
  var grid = document.querySelector('.clients-list')
  if (!grid) return

  var setRows = function () {
    var items = grid.querySelectorAll('.clients-item')
    if (!items.length) return
    var cols = window.innerWidth < 480 ? 2 : 3
    grid.style.gridTemplateRows = 'repeat(' + Math.ceil(items.length / cols) + ', auto)'
  }

  setRows()
  window.addEventListener('resize', setRows)
}

// ==========================================================
//  PAGE: MANAGEMENT
// ==========================================================
function initManagementPage() {
  var modelInfo = document.querySelector('#modelName')
  var logo = document.querySelector('#logo')
  var header = document.querySelector('.model-header')
  var modelExplore = document.querySelector('#modelExplore')

  document.querySelectorAll('.models-gallery-item').forEach(function (wrap) {
    var inner = wrap.querySelector('.models-gallery-img-inner')
    if (!inner) return
    gsap.fromTo(inner, { scale: 1 }, {
      scale: 0,
      ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom top', scrub: true },
    })
  })

  var progressBar = document.querySelector('.model-progress')
  var firstItem = document.querySelector('.models-gallery-item:first-child .models-gallery-img-inner')
  var lastItem = document.querySelector('.models-gallery-item:last-child .models-gallery-img-inner')

  if (progressBar && firstItem && lastItem) {
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: firstItem,
        start: 'top top',
        endTrigger: lastItem,
        end: 'top top',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    })
    gsap.to(progressBar, {
      opacity: 0,
      duration: 0.3,
      ease: 'power1.out',
      scrollTrigger: {
        trigger: lastItem,
        start: 'bottom 60%',
        toggleActions: 'play none none reverse',
        invalidateOnRefresh: true,
      },
    })
  }

  if (modelInfo && logo && header) {
    ScrollTrigger.create({
      trigger: modelInfo,
      start: 'bottom top',
      onEnter: function () {
        gsap.to(logo, { opacity: 0, duration: 0.3, ease: 'power1.out', onComplete: function () { logo.style.pointerEvents = 'none' } })
        gsap.to(header, { opacity: 1, yPercent: 100, duration: 0.3, delay: 0.3, ease: 'power1.out' })
      },
      onLeaveBack: function () {
        gsap.to(logo, { opacity: 1, duration: 0.3, delay: 0.3, ease: 'power1.out', onStart: function () { logo.style.pointerEvents = 'auto' } })
        gsap.to(header, { opacity: 0, yPercent: 0, ease: 'power1.out' })
      },
    })
  }

  if (modelExplore && logo && header) {
    ScrollTrigger.create({
      trigger: modelExplore,
      start: 'top 50%',
      onEnter: function () {
        gsap.to(header, { opacity: 0, yPercent: 0, duration: 0.3, ease: 'power1.out' })
        gsap.to(logo, { opacity: 1, duration: 0.3, delay: 0.3, ease: 'power1.out', onStart: function () { logo.style.pointerEvents = 'auto' } })
      },
      onLeaveBack: function () {
        gsap.to(header, { opacity: 1, yPercent: 100, duration: 0.3, delay: 0.3, ease: 'power1.out' })
        gsap.to(logo, { opacity: 0, duration: 0.3, ease: 'power1.out', onComplete: function () { logo.style.pointerEvents = 'none' } })
      },
    })
  }

  if (logo && header) {
    document.querySelectorAll('[data-link]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (link.getAttribute('data-link') === 'management') return
        gsap.to(logo, { opacity: 1, duration: 0.3, delay: 0.3, ease: 'power1.out', onStart: function () { logo.style.pointerEvents = 'auto' } })
        gsap.to(header, { opacity: 0, yPercent: 0, ease: 'power1.out' })
      })
    })
  }
}

// ==========================================================
//  DATE MASK — #Date-of-Birth → MM/DD/YYYY
//  Insère les slashes automatiquement, bloque les non-chiffres.
// ==========================================================
function initDateMask() {
  var input = document.querySelector('#Date-of-Birth')
  if (!input) return

  input.placeholder = 'MM/DD/YYYY'
  input.maxLength = 10

  function format(val) {
    var d = val.replace(/\D/g, '').slice(0, 8)
    if (d.length <= 2) return d
    if (d.length <= 4) return d.slice(0, 2) + '/' + d.slice(2)
    return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4)
  }

  input.addEventListener('keydown', function (e) {
    var allow = ['Backspace', 'Delete', 'Tab', 'Enter',
                 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (allow.indexOf(e.key) !== -1) return
    if ((e.ctrlKey || e.metaKey) && 'acvx'.indexOf(e.key.toLowerCase()) !== -1) return
    if (!/^\d$/.test(e.key)) e.preventDefault()
  })

  input.addEventListener('input', function () {
    var pos = input.selectionStart
    var prev = input.value
    var next = format(prev)
    input.value = next
    // avance le curseur si un slash vient d'être inséré
    if (next[pos - 1] === '/' && prev[pos - 1] !== '/') pos++
    input.setSelectionRange(pos, pos)
  })

  input.addEventListener('paste', function (e) {
    e.preventDefault()
    var text = (e.clipboardData || window.clipboardData).getData('text')
    input.value = format(text)
  })
}

// ==========================================================
//  MAIN INIT
// ==========================================================
document.addEventListener('DOMContentLoaded', function () {
  var pageEl = document.querySelector('[data-namespace]')
  var page = pageEl ? pageEl.dataset.namespace : null
  var mainW = document.querySelector('.main-w')

  initFormButtons()
  initFileUpload()
  initDateMask()
  initViewButtons()
  initNavigation(mainW)

  if (mainW && !loaderWillPlay) {
    gsap.set(mainW, { opacity: 0 })
    gsap.to(mainW, { opacity: 1, duration: TRANS.duration, ease: TRANS.ease })
  }

  if (page === 'about') initAboutPage()
  if (page === 'management') initManagementPage()

  window.addEventListener('pageshow', function (e) {
    if (e.persisted) window.location.reload()
  })
})
