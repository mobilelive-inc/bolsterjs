import 'global-jsdom/esm/register'

import React, { Suspense } from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import { render, screen } from '@testing-library/react'
import { test } from 'tap'

import mfxp from '..'

/*
 *
 * Test with a mock container, that a mock element contained inside the container
 * when using mfxp experience and navigates, the parent communicates back where it went to
 * when using onParentNavigate.
 *
 * Test with a mock container, that a mock element contained inside the container
 * when using mfxp experience, the experience has access to some piece of state
 *
 * Test without a container that an experience gets render into a dev-preview element by default
 *
 * Test with a container that wrap doesn't trigger any navigation
 */

test('Mfxp wrapped experience inside of container does accesses global state using withMfxp', async () => {
  function SimpleRootPageComponent ({ welcome }) {
    return (
      <div>
        <h3>Simple Component</h3>
        <p>{welcome || 'fails'}</p>
      </div>
    )
  }

  function SimpleExperience ({ history }) {
    return (
      <div>
        <Router history={history}>
          <Switch>
            <Route path='/' component={mfxp.withMfxp(SimpleRootPageComponent)} />
          </Switch>
        </Router>
      </div>
    )
  }

  const MFXPExperience = mfxp(mfxp.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <MFXPExperience welcome='passes' />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </Router>
    )
  }

  render(<ContainerHelper />)
  await screen.findByText('passes')
})

test('Mfxp wrapped experience inside of container does not access global state without useMfxp or withMfxp', async () => {
  function SimpleRootPageComponent ({ welcome }) {
    return (
      <div>
        <h3>Simple Component</h3>
        <p>{welcome || 'fails'}</p>
      </div>
    )
  }

  function SimpleExperience ({ history }) {
    return (
      <div>
        <Router history={history}>
          <Switch>
            <Route path='/' component={SimpleRootPageComponent} />
          </Switch>
        </Router>
      </div>
    )
  }

  const MFXPExperience = mfxp(mfxp.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <MFXPExperience welcome='passes' />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </Router>
    )
  }

  render(<ContainerHelper />)
  await screen.findByText('fails')
})

test('Mfxp wrapped experience inside of container must access container props', async () => {
  function SimpleRootPageComponent () {
    const { welcome } = mfxp.useMfxp()
    return (
      <div>
        <h3>Simple Component</h3>
        <p>{welcome || 'fails'}</p>
      </div>
    )
  }

  function SimpleExperience ({ history }) {
    return (
      <div>
        <Router history={history}>
          <Switch>
            <Route path='/' component={SimpleRootPageComponent} />
          </Switch>
        </Router>
      </div>
    )
  }

  const MFXPExperience = mfxp(mfxp.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <MFXPExperience welcome='passes' />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </Router>
    )
  }

  render(<ContainerHelper />)
  await screen.findByText('passes')
})
