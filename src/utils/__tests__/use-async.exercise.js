import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

beforeEach(() => {
  jest.spyOn(console, 'error')
})

afterEach(() => {
  console.error.mockRestore()
})

const defaultState = {}

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

const pendingState = {
  ...defaultState,
  status: 'pending',
  isIdle: false,
  isLoading: true,
}

const resolvedState = {
  ...defaultState,
  status: 'resolved',
  isIdle: false,
  isSuccess: true,
}

const rejectedState = {
  ...defaultState,
  status: 'rejected',
  isIdle: false,
  isError: true,
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(defaultState)

  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(pendingState)

  const resolvedValue = Symbol('resolved value')
  await act(async () => {
    resolve(resolvedValue)
    await p
  })

  expect(result.current).toEqual({
    ...resolvedState,
    data: resolvedValue,
  })

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(defaultState)
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()
  const {result} = renderHook(() => useAsync())
  expect(result.current).toEqual(defaultState)

  let p
  act(() => {
    p = result.current.run(promise)
  })

  expect(result.current).toEqual(pendingState)

  const rejectedValue = Symbol('resolved value')
  await act(async () => {
    reject(rejectedValue)
    await p.catch(() => {
      // ignore error
      // ignore error
    })
  })

  expect(result.current).toEqual({
    ...rejectedState,
    error: rejectedValue,
  })

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual(defaultState)
})
// 🐨 this will be very similar to the previous test, except you'll reject the
// promise instead and assert on the error state.
// 💰 to avoid the promise actually failing your test, you can catch
//    the promise returned from `run` with `.catch(() => {})`

test('can specify an initial state', async () => {
  const mockData = Symbol('resolved value')
  const customInitialState = {status: 'resolved', data: mockData}
  const {result} = renderHook(() => useAsync(customInitialState))

  expect(result.current).toEqual({
    ...resolvedState,
    data: mockData,
  })
})

test('can set the data', async () => {
  const mockData = Symbol('resolved value')
  const customInitialState = {status: 'resolved', data: mockData}
  const {result} = renderHook(() => useAsync(customInitialState))

  act(() => {
    result.current.setData(mockData)
  })

  expect(result.current).toEqual({
    ...resolvedState,
    data: mockData,
  })
})

test('can set the error', async () => {
  const mockError = Symbol('resolved value')
  const {result} = renderHook(() => useAsync())

  act(() => {
    result.current.setError(mockError)
  })

  expect(result.current).toEqual({
    ...rejectedState,
    error: mockError,
  })
})

test('No state updates happen if the component is unmounted while pending', async () => {
  const {promise, resolve} = deferred()
  const {result, unmount} = renderHook(() => useAsync())
  let p
  act(() => {
    p = result.current.run(promise)
  })
  unmount()
  await act(async () => {
    resolve()
    await p
  })
  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', async () => {
  const {result} = renderHook(() => useAsync())
  expect(() => result.current.run()).toThrowErrorMatchingInlineSnapshot()
})
