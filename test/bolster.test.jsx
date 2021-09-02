import 'global-jsdom/esm/register'

import React, { Suspense } from 'react'
import { Link, Router, Route, Switch, BrowserRouter } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import userEvent from '@testing-library/user-event'
import { render, screen, cleanup } from '@testing-library/react'
import { test, beforeEach } from 'tap'

import bolster from '..'

beforeEach(cleanup)

test('Bolster wrapped experience inside of container does accesses global state using withBolster', async () => {
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
            <Route path='/' component={bolster.withBolster(SimpleRootPageComponent)} />
          </Switch>
        </Router>
      </div>
    )
  }

  const BolsterExperience = bolster(bolster.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <BolsterExperience welcome='passes' />
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

test('Bolster wrapped experience inside of container does not access global state without useBolster or withBolster', async () => {
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

  const BolsterExperience = bolster(bolster.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <BolsterExperience welcome='passes' />
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

test('Bolster wrapped experience inside of container must access container props', async () => {
  function SimpleRootPageComponent () {
    const { welcome } = bolster.useBolster()
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

  const BolsterExperience = bolster(bolster.experience(SimpleExperience, render))

  const history = createBrowserHistory()

  function ContainerHelper () {
    return (
      <Router history={history}>
        <div>
          <Suspense fallback='...loading'>
            <Switch>
              <Route path='/'>
                <BolsterExperience welcome='passes' />
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

test('Bolster wrapped experience uses react router to navigate properly', async () => {
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

  const BolsterAboutExp = bolster(bolster.experience(About, render))
  const BolsterHomeExp = bolster(bolster.experience(Home, render))

  function App () {
    return (
      <div>
        <BrowserRouter>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
          <Suspense fallback='...loading'>
            <Switch>

              <Route path='/about'>
                <BolsterAboutExp />
              </Route>
              <Route path='/'>
                <BolsterHomeExp />
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
