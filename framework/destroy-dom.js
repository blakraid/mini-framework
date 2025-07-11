import { removeEventListeners } from './events.js'
import { DOM_TYPES } from './h.js'

function removeTextNode(vdom) {
  const { el } = vdom
  if (el && el.parentNode) {
    try {
      el.remove()
    } catch (error) {
      // Element might have already been removed
      console.warn('Element already removed from DOM:', error.message)
    }
  }
}

function removeElementNode(vdom) {
  const { el, children, listeners } = vdom

  if (el && el.parentNode) {
    try {
      el.remove()
    } catch (error) {
      
    }
  }
  
  children.forEach(destroyDOM)

  if (listeners && el) {
    removeEventListeners(listeners, el)
    delete vdom.listeners
  }
}

function removeFragmentNodes(vdom) {
  const { children } = vdom
  children.forEach(destroyDOM)
}

export function destroyDOM(vdom) {
  if (!vdom) return
  
  const { type } = vdom

  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom)
      break
    }
    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom)
      break
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom)
      break
    }
    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`)
    }
  }

  delete vdom.el
}