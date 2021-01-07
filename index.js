'use strict'
const global = require('globalthis')()
const { useHistory } = peerRequireRrd()
const { createMemoryHistory, createBrowserHistory } = peerRequireHistory()
const { useRef, useEffect, createElement, createContext, useContext, lazy } = peerRequireReact()
const kMfxp = Symbol.for('mfxp')
global[kMfxp] = global[kMfxp] || createContext({})

const mfxp = (experience) => lazy(async () => {
  const bootstrap = await experience
  const { mount = bootstrap.mount } = bootstrap.default || {}
  
  return {
    default: function (props) {
      const ref = useRef(null)
      const history = useHistory()
      function onNavigate (next) {
        if (history.location !== next.pathname) {
          history.push(next.pathname)
        }
      }
    
      useEffect(() => {
        const cmp = mount(ref.current, Object.assign({
          initialPath: history.location.pathname,
          onNavigate: onNavigate
        }, props))
    
        history.listen(cmp.onParentNavigate)
      }, [])
    
      return createElement('div', { ref: ref })
    }
  }
})

mfxp.wrap = (experience) => lazy(async () => {
  const { mount } = await experience
  return {
    default: function (props) {
      const ref = useRef(null)

      useEffect(() => {
        mount(ref.current, props)
      }, [])

      return createElement('div', { ref: ref })
    }
  }
})

mfxp.MfxpConsumer = ({ children }) => {
  return createElement(global[kMfxp].Consumer, { children: children })
}

mfxp.MfxpProvider = ({ state, children }) => {
  return createElement(global[kMfxp].Provider, { value: state, children: children })
}

mfxp.useMfxp = () => {
  return useContext(global[kMfxp])
}

mfxp.withMfxp = (cmp) => {
  return (props) => {
    return createElement(cmp, {...props, ...mfxp.useMfxp()})
  }
}

mfxp.getMfxpContextType = () => global[kMfxp]

mfxp.StandaloneExperience = () => null

mfxp.experience = (root, render, standalone = {}) => {
  const inject = (el, history, state) => {
    const tree = createElement(mfxp.MfxpProvider, {
      state: state,
      children: createElement(root, { history })
    })
    render(tree, el)
  }

  const mount = (el, { onNavigate, initialPath, ...state }) => {
    const history = createMemoryHistory({
      initialEntries: [initialPath]
    })
  
    history.listen(onNavigate)

    inject(el, history, state)
  
    return {
      onParentNavigate ({ pathname: nextPathName }) {
        const { pathname } = history.location
  
        if (pathname !== nextPathName) {
          history.push(nextPathName)
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    const devRoot = document.querySelector(`#dev-preview`)
    if (devRoot) inject(devRoot, createBrowserHistory(), standalone.props)
  }

  return { mount }
}


module.exports = mfxp


// A variable/param can't be used to genericise these functions into one function
// strings must be passed to `require` for WebPack. 
function peerRequireRrd () {
  try {
    return require('react-router-dom')
  } catch {
    throw Error(`react-router-dom is a required peer dependency of mfxp`)
  }
}

function peerRequireHistory () {
  try {
    return require('history')
  } catch {
    throw Error(`history is a required peer dependency of mfxp`)
  }
}

function peerRequireReact () {
  try {
    return require('react')
  } catch {
    throw Error(`react is a required peer dependency of mfxp`)
  }
}