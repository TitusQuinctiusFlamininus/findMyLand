import {
  useEffect,
  useRef,
  useState
} from 'react'

import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl
} from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import {
  getRoute
} from './services/routingService'

import {
  FaHospital,
  FaSchool,
  FaBus,
  FaUniversity,
  FaHotel,
  FaGasPump,
  FaStore,
  FaTrain,
  FaPlane,
  FaTree,
  FaShieldAlt,
  FaFire,
  FaUtensils,
  FaLandmark,
  FaBriefcaseMedical,
  FaHome,
  FaWalking,
  FaCar
} from 'react-icons/fa'

export default function ParcelMap({ data }) {

  const mapRef = useRef(null)

  // =====================================================
  // STATE
  // =====================================================

  const [popup, setPopup] =
    useState(null)

  const [selectedLocation, setSelectedLocation] =
    useState(null)

  const [mapStyle, setMapStyle] =
    useState('dataviz')

  const [routeGeoJSON, setRouteGeoJSON] =
    useState(null)

  const [travelMode, setTravelMode] =
    useState('driving')

  const [routeInfo, setRouteInfo] =
    useState(null)

  // =====================================================
  // MAP STYLES
  // =====================================================

  const styles = {

    streets:
      'https://api.maptiler.com/maps/streets/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    satellite:
      'https://api.maptiler.com/maps/hybrid/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    dataviz:
      'https://api.maptiler.com/maps/dataviz/style.json?key=9OLAYy7YFpmPdRnxMmfS'
  }

  // =====================================================
  // INFRASTRUCTURE
  // =====================================================

  const infrastructure = []

  if (data.infrastructure) {

    Object.entries(
      data.infrastructure
    ).forEach(([key, value]) => {

      if (value) {

        infrastructure.push({

          category: key,

          ...value
        })
      }
    })
  }

  // =====================================================
  // POLYGON
  // =====================================================

  const polygon = {

    type: 'Feature',

    geometry: {

      type: 'Polygon',

      coordinates: [[

        ...data.coordinates.map(
          ([lat, lon]) => [lon, lat]
        )

      ]]
    }
  }

  // =====================================================
  // INITIAL CAMERA
  // =====================================================

  useEffect(() => {

    if (!mapRef.current) return

    mapRef.current.flyTo({

      center: [

        data.center[1],

        data.center[0]
      ],

      zoom: 14,

      pitch: 55,

      bearing: -20,

      duration: 4000
    })

  }, [data])

  // =====================================================
  // ROUTE REBUILD
  // =====================================================

  useEffect(() => {

    if (popup) {

      buildRoute(popup)
    }

  }, [travelMode])

  // =====================================================
  // PULSE ANIMATION
  // =====================================================

  useEffect(() => {

    const style =
      document.createElement('style')

    style.innerHTML = `
      @keyframes pulse {

        0% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.35);
        }

        100% {
          transform: scale(1);
        }
      }
    `

    document.head.appendChild(style)

  }, [])

  // =====================================================
  // RETURN TO PARCEL
  // =====================================================

  const returnToParcel = () => {

    if (!mapRef.current) return

    mapRef.current.flyTo({

      center: [

        data.center[1],

        data.center[0]
      ],

      zoom: 14,

      pitch: 55,

      bearing: -20,

      duration: 3500
    })

    setPopup(null)

    setSelectedLocation(null)

    setRouteGeoJSON(null)

    setRouteInfo(null)
  }

  // =====================================================
  // ROUTE COLORS
  // =====================================================

  const routeColor = () => {

    switch(travelMode) {

      case 'driving':
        return '#00BFFF'

      case 'walking':
        return '#00FF99'

      case 'bus':
        return '#FFD700'

      case 'train':
        return '#FF00FF'

      default:
        return '#00BFFF'
    }
  }

  // =====================================================
  // ROUTING
  // =====================================================

  const buildRoute = async (item) => {

    try {

      console.log(
        'BUILD ROUTE:',
        travelMode
      )

      const route = await getRoute({

        startLat: item.lat,

        startLon: item.lon,

        endLat: data.center[0],

        endLon: data.center[1],

        mode: travelMode
      })

      console.log(
        'ROUTE RESPONSE:',
        route
      )

      if (!route) return

      // ==========================================
      // GEOJSON
      // ==========================================

      setRouteGeoJSON({

        type: 'Feature',

        geometry: route.geometry
      })

      // ==========================================
      // DURATION
      // ==========================================

      const durationMinutes =
        Math.round(
          route.duration_seconds / 60
        )

      // ==========================================
      // TRANSPORT TIMES
      // ==========================================

      const routeTimes = {

        drivingMinutes: null,

        walkingMinutes: null,

        busMinutes: null,

        trainMinutes: null
      }

      if (
        route.mode === 'driving'
      ) {

        routeTimes.drivingMinutes =
          durationMinutes
      }

      if (
        route.mode === 'walking'
      ) {

        routeTimes.walkingMinutes =
          durationMinutes
      }

      if (
        route.mode === 'bus'
      ) {

        routeTimes.busMinutes =
          durationMinutes
      }

      if (
        route.mode === 'train' ||
        route.mode === 'subway'
      ) {

        routeTimes.trainMinutes =
          durationMinutes
      }

      // ==========================================
      // ROUTE INFO
      // ==========================================

      setRouteInfo({

        distanceKm:

          (
            route.distance_meters / 1000
          ).toFixed(1),

        provider:
          route.provider,

        mode:
          route.mode,

        nearestStop:
          route.nearest_stop,

        ...routeTimes
      })

    } catch (err) {

      console.error(
        'ROUTING ERROR:',
        err
      )
    }
  }

  // =====================================================
  // FLY TO LOCATION
  // =====================================================

  const flyToLocation = async (item) => {

    if (!mapRef.current) return

    mapRef.current.flyTo({

      center: [

        item.lon,

        item.lat
      ],

      zoom: 16,

      pitch: 65,

      bearing: -25,

      duration: 3500,

      essential: true
    })

    setPopup(item)

    setSelectedLocation(
      item.category
    )

    await buildRoute(item)
  }

  // =====================================================
  // CATEGORY ICONS
  // =====================================================

  const categoryIcon = (category) => {

    switch(category) {

      case 'hospital':
        return <FaHospital color="red" />

      case 'school':
        return <FaSchool color="blue" />

      case 'bus_stop':
        return <FaBus color="green" />

      case 'university':
        return <FaUniversity color="purple" />

      case 'hotel':
        return <FaHotel color="orange" />

      case 'bank':
        return <FaLandmark color="gold" />

      case 'fuel':
        return <FaGasPump color="black" />

      case 'supermarket':
        return <FaStore color="pink" />

      case 'railway':
        return <FaTrain color="brown" />

      case 'airport':
        return <FaPlane color="gray" />

      case 'park':
        return <FaTree color="green" />

      case 'police':
        return <FaShieldAlt color="navy" />

      case 'fire_station':
        return <FaFire color="orangered" />

      case 'pharmacy':

        return (
          <FaBriefcaseMedical color="teal" />
        )

      case 'restaurant':

        return (
          <FaUtensils color="darkred" />
        )

      default:
        return '📍'
    }
  }

  // =====================================================
  // TRANSPORT BUTTON STYLE
  // =====================================================

  const transportButtonStyle = (
    mode
  ) => {

    let activeColor = '#00BFFF'

    if (mode === 'walking') {
      activeColor = '#00FF99'
    }

    if (mode === 'bus') {
      activeColor = '#FFD700'
    }

    if (mode === 'train') {
      activeColor = '#FF00FF'
    }

    return {

      width: 60,

      height: 60,

      borderRadius: '50%',

      border: 'none',

      cursor: 'pointer',

      background:

        travelMode === mode

          ? activeColor

          : '#2a2a2a',

      color:

        travelMode === mode

          ? 'black'

          : 'white',

      fontSize: 24,

      transition: 'all 0.3s ease',

      boxShadow:

        travelMode === mode

          ? `0 0 20px ${activeColor}`

          : 'none'
    }
  }

  return (

    <div
      style={{
        position: 'relative'
      }}
    >

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <div
        style={{

          position: 'absolute',

          left: 20,

          top: 20,

          zIndex: 10,

          width: 340,

          maxHeight: 950,

          overflowY: 'auto',

          background:
            'rgba(20,20,20,0.92)',

          color: 'white',

          padding: 20,

          borderRadius: 20,

          backdropFilter: 'blur(10px)',

          boxShadow:
            '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >

        {/* ============================================= */}
        {/* RETURN */}
        {/* ============================================= */}

        <button

          onClick={returnToParcel}

          style={{

            width: '100%',

            padding: 16,

            marginBottom: 20,

            borderRadius: 16,

            border: 'none',

            background: '#ff6600',

            color: 'black',

            fontWeight: 'bold',

            cursor: 'pointer',

            fontSize: 16
          }}
        >

          <FaHome />

          {' '}

          Return To Parcel

        </button>

        {/* ============================================= */}
        {/* TITLE */}
        {/* ============================================= */}

        <h2>
          Intelligence
        </h2>

        {/* ============================================= */}
        {/* MAP STYLES */}
        {/* ============================================= */}

        <div
          style={{
            marginBottom: 20
          }}
        >

          <button
            onClick={() =>
              setMapStyle('streets')
            }
          >
            Streets
          </button>

          <button
            onClick={() =>
              setMapStyle('satellite')
            }
            style={{
              marginLeft: 8
            }}
          >
            Satellite
          </button>

          <button
            onClick={() =>
              setMapStyle('dataviz')
            }
            style={{
              marginLeft: 8
            }}
          >
            Dataviz
          </button>

        </div>

        {/* ============================================= */}
        {/* TRANSPORT MODES */}
        {/* ============================================= */}

        <div
          style={{
            marginBottom: 25
          }}
        >

          <h4>
            Transport Mode
          </h4>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 10
            }}
          >

            {/* CAR */}

            <button

              onClick={() =>
                setTravelMode(
                  'driving'
                )
              }

              style={
                transportButtonStyle(
                  'driving'
                )
              }
            >

              <FaCar />

            </button>

            {/* WALK */}

            <button

              onClick={() =>
                setTravelMode(
                  'walking'
                )
              }

              style={
                transportButtonStyle(
                  'walking'
                )
              }
            >

              <FaWalking />

            </button>

            {/* BUS */}

            <button

              onClick={() =>
                setTravelMode(
                  'bus'
                )
              }

              style={
                transportButtonStyle(
                  'bus'
                )
              }
            >

              <FaBus />

            </button>

            {/* TRAIN */}

            <button

              onClick={() =>
                setTravelMode(
                  'train'
                )
              }

              style={
                transportButtonStyle(
                  'train'
                )
              }
            >

              <FaTrain />

            </button>

          </div>

        </div>

        {/* ============================================= */}
        {/* ROUTE INFO */}
        {/* ============================================= */}

        {routeInfo && (

          <div
            style={{

              background: '#2c2c2c',

              padding: 18,

              borderRadius: 16,

              marginBottom: 25
            }}
          >

            <h3>
              Route Intelligence
            </h3>

            <p>
              Distance:
              {' '}
              {routeInfo.distanceKm} km
            </p>

            <p>
              Provider:
              {' '}
              {routeInfo.provider}
            </p>

            <p>
              Mode:
              {' '}
              {routeInfo.mode}
            </p>

            {routeInfo.nearestStop && (

              <div
                style={{
                  marginTop: 15
                }}
              >

                <h4>
                  Transit Stops
                </h4>

                <div>

                  Origin:
                  {' '}

                  {
                    routeInfo
                      .nearestStop
                      .origin
                  }

                </div>

                <div>

                  Destination:
                  {' '}

                  {
                    routeInfo
                      .nearestStop
                      .destination
                  }

                </div>

              </div>

            )}

            <div
              style={{
                marginTop: 15
              }}
            >

              {routeInfo.drivingMinutes && (

                <div>

                  <FaCar color="#00BFFF" />

                  {' '}

                  Driving:
                  {' '}

                  {
                    routeInfo
                      .drivingMinutes
                  }

                  {' '}
                  mins

                </div>

              )}

              {routeInfo.walkingMinutes && (

                <div
                  style={{
                    marginTop: 8
                  }}
                >

                  <FaWalking color="#00FF99" />

                  {' '}

                  Walking:
                  {' '}

                  {
                    routeInfo
                      .walkingMinutes
                  }

                  {' '}
                  mins

                </div>

              )}

              {routeInfo.busMinutes && (

                <div
                  style={{
                    marginTop: 8
                  }}
                >

                  <FaBus color="#FFD700" />

                  {' '}

                  Bus:
                  {' '}

                  {
                    routeInfo
                      .busMinutes
                  }

                  {' '}
                  mins

                </div>

              )}

              {routeInfo.trainMinutes && (

                <div
                  style={{
                    marginTop: 8
                  }}
                >

                  <FaTrain color="#FF00FF" />

                  {' '}

                  Train:
                  {' '}

                  {
                    routeInfo
                      .trainMinutes
                  }

                  {' '}
                  mins

                </div>

              )}

            </div>

          </div>

        )}

        {/* ============================================= */}
        {/* INFRASTRUCTURE */}
        {/* ============================================= */}

        {infrastructure.map((item, idx) => (

          <button

            key={idx}

            onClick={() =>
              flyToLocation(item)
            }

            style={{

              width: '100%',

              textAlign: 'left',

              marginBottom: 12,

              padding: 14,

              borderRadius: 14,

              border: 'none',

              cursor: 'pointer',

              background:

                selectedLocation === item.category

                  ? '#00FF99'

                  : '#2a2a2a',

              color:

                selectedLocation === item.category

                  ? 'black'

                  : 'white',

              transition: 'all 0.3s ease'
            }}
          >

            <div
              style={{

                fontWeight: 'bold',

                display: 'flex',

                alignItems: 'center',

                gap: 10
              }}
            >

              {
                categoryIcon(
                  item.category
                )
              }

              {item.category}

            </div>

            <div
              style={{
                fontSize: 13,
                marginTop: 6,
                opacity: 0.8
              }}
            >

              {item.name}

            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 4
              }}
            >

              {item.distance_km} km away

            </div>

          </button>

        ))}

      </div>

      {/* ================================================= */}
      {/* MAP */}
      {/* ================================================= */}

      <Map

        ref={mapRef}

        initialViewState={{

          longitude: data.center[1],

          latitude: data.center[0],

          zoom: 14,

          pitch: 45,

          bearing: -20
        }}

        style={{
          width: '100%',
          height: '1000px',
          borderRadius: '20px'
        }}

        mapStyle={styles[mapStyle]}
      >

        <NavigationControl />

        {/* ============================================= */}
        {/* PARCEL */}
        {/* ============================================= */}

        <Source
          id="parcel"
          type="geojson"
          data={polygon}
        >

          <Layer
            id="parcel-fill"
            type="fill"
            paint={{
              'fill-color': '#00FF99',
              'fill-opacity': 0.22
            }}
          />

          <Layer
            id="parcel-glow"
            type="line"
            paint={{
              'line-color': '#00FF99',
              'line-width': 8,
              'line-opacity': 0.4,
              'line-blur': 5
            }}
          />

          <Layer
            id="parcel-outline"
            type="line"
            paint={{
              'line-color': '#00FF99',
              'line-width': 3
            }}
          />

        </Source>

        {/* ============================================= */}
        {/* ROUTE */}
        {/* ============================================= */}

        {routeGeoJSON && (

          <Source
            id="route"
            type="geojson"
            data={routeGeoJSON}
          >

            <Layer
              id="route-line"
              type="line"
              paint={{

                'line-color': routeColor(),

                'line-width': 6,

                'line-opacity': 0.9
              }}
            />

          </Source>

        )}

        {/* ============================================= */}
        {/* MARKERS */}
        {/* ============================================= */}

        {infrastructure.map((item, idx) => (

          <Marker

            key={idx}

            longitude={item.lon}

            latitude={item.lat}
          >

            <div

              onClick={() =>
                flyToLocation(item)
              }

              style={{

                cursor: 'pointer',

                fontSize: 28,

                animation:

                  selectedLocation === item.category

                    ? 'pulse 1.5s infinite'

                    : 'none'
              }}
            >

              {
                categoryIcon(
                  item.category
                )
              }

            </div>

          </Marker>

        ))}

        {/* ============================================= */}
        {/* POPUP */}
        {/* ============================================= */}

        {popup && (

          <Popup

            longitude={popup.lon}

            latitude={popup.lat}

            onClose={() =>
              setPopup(null)
            }
          >

            <div>

              <h3>
                {popup.name}
              </h3>

              <p>
                {popup.category}
              </p>

              <p>
                {popup.distance_km} km away
              </p>

            </div>

          </Popup>

        )}

      </Map>

    </div>
  )
}