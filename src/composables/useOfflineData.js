// useOfflineData.js - Composable for offline-first data loading
import { ref, reactive } from 'vue'

export function useOfflineData() {
  const loadingState = reactive({
    gares: false,
    communes: false,
    streets: false
  })

  const dataState = reactive({
    gares: [],
    communes: [],
    streets: [],
    lastUpdated: {
      gares: null,
      communes: null,
      streets: null
    }
  })

  const errors = reactive({
    gares: null,
    communes: null,
    streets: null
  })

  // Cache-first data loading strategy
  const loadDataOfflineFirst = async (filename, dataKey) => {
    loadingState[dataKey] = true
    errors[dataKey] = null

    try {
      // Try to fetch from network/cache via service worker
      const response = await fetch(`/${filename}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status}`)
      }

      const data = await response.json()
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format for ${filename}`)
      }

      dataState[dataKey] = data
      dataState.lastUpdated[dataKey] = new Date().toISOString()
      
      console.log(`Loaded ${filename}: ${data.length} items`)
      return data

    } catch (error) {
      console.error(`Error loading ${filename}:`, error)
      errors[dataKey] = error.message
      
      // Return empty array as fallback
      dataState[dataKey] = []
      return []
    } finally {
      loadingState[dataKey] = false
    }
  }

  // Load specific data sets
  const loadGares = () => loadDataOfflineFirst('gare.json', 'gares')
  const loadCommunes = () => loadDataOfflineFirst('output.json', 'communes')  
  const loadStreets = () => loadDataOfflineFirst('streets.json', 'streets')

  // Load all data
  const loadAllData = async () => {
    console.log('Loading all data files...')
    
    const results = await Promise.allSettled([
      loadGares(),
      loadCommunes(),
      loadStreets()
    ])

    const failedLoads = results
      .map((result, index) => ({ result, name: ['gares', 'communes', 'streets'][index] }))
      .filter(({ result }) => result.status === 'rejected')

    if (failedLoads.length > 0) {
      console.warn('Some data files failed to load:', failedLoads)
    }

    return {
      gares: dataState.gares,
      communes: dataState.communes,
      streets: dataState.streets,
      errors: { ...errors },
      success: failedLoads.length === 0
    }
  }

  // Check if data is available
  const isDataLoaded = (dataKey) => {
    return dataState[dataKey] && dataState[dataKey].length > 0
  }

  const isAllDataLoaded = () => {
    return isDataLoaded('gares') && isDataLoaded('communes') && isDataLoaded('streets')
  }

  // Get data with automatic loading
  const getGares = async () => {
    if (!isDataLoaded('gares') && !loadingState.gares) {
      await loadGares()
    }
    return dataState.gares
  }

  const getCommunes = async () => {
    if (!isDataLoaded('communes') && !loadingState.communes) {
      await loadCommunes()
    }
    return dataState.communes
  }

  const getStreets = async () => {
    if (!isDataLoaded('streets') && !loadingState.streets) {
      await loadStreets()
    }
    return dataState.streets
  }

  // Search utilities
  const searchGares = async (query, limit = 100) => {
    const gares = await getGares()
    if (!query || query.length < 2) return []

    const searchTerm = query.toLowerCase()
    return gares
      .filter(gare => {
        const name = typeof gare === 'object' ? gare['Nom Gare'] : gare
        return name && name.toLowerCase().includes(searchTerm)
      })
      .slice(0, limit)
  }

  const searchCommunes = async (communeQuery = '', postalQuery = '', limit = 100) => {
    const communes = await getCommunes()
    
    if ((!communeQuery || communeQuery.length < 2) && (!postalQuery || postalQuery.length < 2)) {
      return []
    }

    const communeTerm = communeQuery.toLowerCase()
    const postalTerm = postalQuery

    return communes
      .filter(item => {
        if (!item) return false

        const commune = item.COMMUNE ? item.COMMUNE.toLowerCase() : ''
        const postalCode = item['CODE POSTAL'] ? item['CODE POSTAL'].toString() : ''

        const communeMatch = !communeQuery || commune.includes(communeTerm)
        const postalMatch = !postalQuery || postalCode.startsWith(postalTerm)

        return communeMatch && postalMatch
      })
      .slice(0, limit)
  }

  const searchStreets = async (query, limit = 100) => {
    const streets = await getStreets()
    if (!query || query.length < 2) return []

    const searchTerm = query.toLowerCase()
    return streets
      .filter(street => street && street.toLowerCase().includes(searchTerm))
      .slice(0, limit)
  }

  // Utility to get data size info
  const getDataStats = () => {
    return {
      gares: {
        count: dataState.gares.length,
        loaded: isDataLoaded('gares'),
        loading: loadingState.gares,
        lastUpdated: dataState.lastUpdated.gares,
        error: errors.gares
      },
      communes: {
        count: dataState.communes.length,
        loaded: isDataLoaded('communes'),
        loading: loadingState.communes,
        lastUpdated: dataState.lastUpdated.communes,
        error: errors.communes
      },
      streets: {
        count: dataState.streets.length,
        loaded: isDataLoaded('streets'),
        loading: loadingState.streets,
        lastUpdated: dataState.lastUpdated.streets,
        error: errors.streets
      }
    }
  }

  // Clear all cached data (forces reload)
  const clearDataCache = () => {
    dataState.gares = []
    dataState.communes = []
    dataState.streets = []
    dataState.lastUpdated.gares = null
    dataState.lastUpdated.communes = null
    dataState.lastUpdated.streets = null
    errors.gares = null
    errors.communes = null
    errors.streets = null
  }

  return {
    // State
    loadingState: readonly(loadingState),
    dataState: readonly(dataState),
    errors: readonly(errors),

    // Loading functions
    loadGares,
    loadCommunes,
    loadStreets,
    loadAllData,

    // Data getters
    getGares,
    getCommunes,
    getStreets,

    // Search functions
    searchGares,
    searchCommunes,
    searchStreets,

    // Utilities
    isDataLoaded,
    isAllDataLoaded,
    getDataStats,
    clearDataCache
  }
}

// Helper function to make reactive objects readonly
function readonly(obj) {
  return new Proxy(obj, {
    set() {
      console.warn('Attempted to modify readonly object')
      return false
    },
    deleteProperty() {
      console.warn('Attempted to delete property from readonly object')
      return false
    }
  })
}