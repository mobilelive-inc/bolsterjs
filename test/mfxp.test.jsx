import 'global-jsdom/esm/register'

import React, { Suspense } from 'react'
import { Link, Router, Route, Switch, BrowserRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import userEvent from '@testing-library/user-event'
import { render, screen, cleanup } from '@testing-library/react'
import { test, beforeEach } from 'tap'

import mfxp from '..'

beforeEach(cleanup)

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

test('Mfxp wrapped experience uses react router to navigate properly', async () => {
  function About ({ history }) {
    return (
      <Router history={history}>
        <Switch>
          <Route path='/about'>
            <div>You are on the about page</div>
            <Link to='/'>Go back</Link>
          </Route>
        </Switch>
      </Router>
    )
  }

  function Home ({ history }) {
    return (
      <Router history={history}>
        <Switch>
          <Route path='/'>
            <div>You are home</div>
          </Route>
        </Switch>
      </Router>
    )
  }

  const MFXPAboutExp = mfxp(mfxp.experience(About, render))
  const MFXPHomeExp = mfxp(mfxp.experience(Home, render))

  function App () {
    return (
      <div>
        <BrowserRouter>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
          <Suspense fallback='...loading'>
            <Switch>

              <Route path='/about'>
                <MFXPAboutExp />
              </Route>
              <Route path='/'>
                <MFXPHomeExp />
              </Route>

            </Switch>
          </Suspense>
        </BrowserRouter>
      </div>
    )
  }

  render(<App />)
  await screen.findByText('You are home')
  userEvent.click(screen.getByText('About'))
  await screen.findByText('You are on the about page')
  userEvent.click(screen.getByText('Go back'))
  await screen.findAllByText('You are home')
})
