'use strict'
const global = require('globalthis')()
const { useHistory } = peerRequireRrd()
const { createMemoryHistory, createBrowserHistory } = peerRequireHistory()
const { useRef, useEffect, createElement, createContext, useContext, lazy } = peerRequireReact()
const Rsr = require('react-shallow-renderer')
const kBolster = Symbol.for('bolsterjs')
global[kBolster] = global[kBolster] || createContext({})

const defaultErrorHandler = ({ err }) => createElement('div', null, `Error Loading Experience: "${err.message}"`)

const bolster = (experience, errorHandler = defaultErrorHandler) => lazy(async () => {
  try {
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
  } catch (err) {
    return errorHandler({ err })
  }
})

bolster.wrap = (experience) => lazy(async () => {
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

bolster.BolsterConsumer = ({ children }) => {
  return createElement(global[kBolster].Consumer, { children: children })
}

bolster.BolsterProvider = ({ state, children }) => {
  return createElement(global[kBolster].Provider, { value: state, children: children })
}

bolster.useBolster = () => {
  return useContext(global[kBolster])
}

bolster.withBolster = (cmp) => {
  return (props) => {
    return createElement(cmp, { ...props, ...bolster.useBolster() })
  }
}

bolster.getBolsterContextType = () => global[kBolster]

bolster.StandaloneExperience = (props) => createElement('div', props)

bolster.experience = (root, render, standalone = {}) => {
  const re = new Rsr()

  const inject = (el, history, state) => {
    const tree = createElement(bolster.BolsterProvider, {
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
    const devRoot = document.querySelector('#dev-preview')
    const props = standalone.type === this.StandaloneExperience ? standalone.props : re.render(standalone).props
    if (devRoot) inject(devRoot, createBrowserHistory(), props)
  }

  return { mount }
}

module.exports = bolster

// A variable/param can't be used to genericise these functions into one function
// strings must be passed to `require` for WebPack.
function peerRequireRrd () {
  try {
    return require('react-router-dom')
  } catch {
    throw Error('react-router-dom is a required peer dependency of bolster')
  }
}

function peerRequireHistory () {
  try {
    return require('history')
  } catch {
    throw Error('history is a required peer dependency of bolster')
  }
}

function peerRequireReact () {
  try {
    return require('react')
  } catch {
    throw Error('react is a required peer dependency of bolster')
  }
}
