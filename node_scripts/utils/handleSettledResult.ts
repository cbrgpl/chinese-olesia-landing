/** @description makes error logs in console and returns fulfilled result's values */
export const handleSettledResult = <T>( results: Array<PromiseSettledResult<T>>, onErrTitle: string): T[] => {
  const rejectedResults = results.filter( res => res.status === 'rejected' )
  if(rejectedResults.length !== 0 ) {
    console.group(onErrTitle)
    for(const rejectedResult of rejectedResults) {
      console.error(rejectedResult.reason)
    }
    console.groupEnd()
  }

  return results.filter( res => res.status === 'fulfilled' ).map( res => res.value )
}
