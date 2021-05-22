/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {useAuth} from './context/auth-context.exercise'

function App() {
  const {user} = useAuth()
  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

export {App}
