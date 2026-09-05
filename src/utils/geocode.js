const geocodeCache = new Map()

export const geocodeAddress = (query, center) => {
  if (!query) return Promise.resolve(null)

  if (geocodeCache.has(query)) {
    return geocodeCache.get(query)
  }

  const promise = new Promise((resolve) => {
    const options = center
      ? {
          query,
          coordinate: `${center.lng()},${center.lat()}`,
        }
      : { query }

    window.naver.maps.Service.geocode(options, (status, response) => {
      const address = response?.v2?.addresses?.[0]

      if (
        status !== window.naver.maps.Service.Status.OK ||
        !address
      ) {
        resolve(null)
        return
      }

      resolve({
        lat: Number(address.y),
        lng: Number(address.x),
      })
    })
  })

  geocodeCache.set(query, promise)

  return promise
}