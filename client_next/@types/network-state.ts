interface NetworkLoadingState {
  state: 'loading'
}
interface NetworkFailedState {
  state: 'failed'
  code: number
  message: string
}
interface NetworkSuccessState<T> {
  state: 'success'
  data: T
}

type NetworkState<T> =
  | NetworkLoadingState
  | NetworkFailedState
  | NetworkSuccessState<T>

export default NetworkState
