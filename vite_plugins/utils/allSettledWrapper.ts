const logRejectedErrors = ( results: PromiseSettledResult<unknown>[], onErrTitle: string ) => {
  const rejectedResults = results.filter( res => res.status === 'rejected' )
  if(rejectedResults.length !== 0 ) {
    console.group(onErrTitle)
    for(const rejectedResult of rejectedResults) {
      console.error(rejectedResult.reason)
    }
    console.groupEnd()
  }
}

export const allSettledWrapper = async <T>( promises: Promise<T>[], onErrorTitle: string = 'Rejected results of Promise.allSettled' ) => {
  const results = await Promise.allSettled(promises)
  logRejectedErrors(results, onErrorTitle)
  const fulfilledResults = results.filter( res => res.status === 'fulfilled' ).map( res => res.value )
  return fulfilledResults
}
