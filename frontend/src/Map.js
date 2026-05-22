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
  FaCar,

  FaArrowRight,
  FaArrowLeft,
  FaArrowUp,

  FaSubway

} from 'react-icons/fa'

export default function ParcelMap({
  data
}) {

  const mapRef = useRef(null)

  // =====================================================
  // STATE
  // =====================================================

  const [popup, setPopup] =
    useState(null)

  const [selectedLocation, setSelectedLocation] =
    useState(null)

  const [routeGeoJSON, setRouteGeoJSON] =
    useState(null)

  const [travelMode, setTravelMode] =
    useState('driving')

  const [routeInfo, setRouteInfo] =
    useState(null)

  // =====================================================
  // MAP STYLE
  // =====================================================

  const mapStyle =

    `https://api.maptiler.com/maps/dataviz-dark/style.json?key=SOME_API_KEY`

  // =====================================================
  // FILTER INFRASTRUCTURE
  // =====================================================

  const infrastructure = Object.entries(
    data.infrastructure || {}
  )

  .filter(([_, value]) => value)

  .map(([key, value]) => ({

    category: key,

    ...value
  }))

  // =====================================================
  // POLYGON
  // =====================================================

  const polygon = {

    type: 'Feature',

    geometry: {

      type: 'Polygon',

      coordinates: [[

        ...data.coordinates.map(
          ([lat, lon]) => [

            lon,

            lat
          ]
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

      duration: 2500
    })

  }, [data])

  // =====================================================
  // CATEGORY ICONS
  // =====================================================

  const categoryIcon = (
    category
  ) => {

    switch(category) {

      case 'hospital':
        return (
          <FaHospital color="#ff4d4d" />
        )

      case 'school':
        return (
          <FaSchool color="#4da6ff" />
        )

      case 'bus_stop':
        return (
          <FaBus color="#00ffaa" />
        )

      case 'railway':
        return (
          <FaTrain color="#ff00ff" />
        )

      case 'restaurant':
        return (
          <FaUtensils color="#ffaa00" />
        )

      case 'pharmacy':
        return (
          <FaBriefcaseMedical color="#00e1ff" />
        )

      case 'fuel':
        return (
          <FaGasPump color="#ffd700" />
        )

      case 'bank':
        return (
          <FaLandmark color="#ffe066" />
        )

      case 'supermarket':
        return (
          <FaStore color="#ff77ff" />
        )

      case 'airport':
        return (
          <FaPlane color="#ffffff" />
        )

      case 'park':
        return (
          <FaTree color="#00ff66" />
        )

      case 'police':
        return (
          <FaShieldAlt color="#7dc3ff" />
        )

      case 'fire_station':
        return (
          <FaFire color="#ff6633" />
        )

      case 'hotel':
        return (
          <FaHotel color="#cc99ff" />
        )

      case 'university':
        return (
          <FaUniversity color="#ff9933" />
        )

      default:
        return '📍'
    }
  }

  // =====================================================
  // ROUTE COLOR
  // =====================================================

  const routeColor = () => {

    switch(travelMode) {

      case 'walking':
        return '#00ffaa'

      case 'bus':
        return '#ffd700'

      case 'train':
        return '#ff00ff'

      default:
        return '#00bfff'
    }
  }

  // =====================================================
  // TURN ICONS
  // =====================================================

  const turnIcon = (
    instruction
  ) => {

    if (!instruction)
      return <FaArrowUp />

    const text =
      instruction.toLowerCase()

    if (
      text.includes('left')
    ) {
      return <FaArrowLeft />
    }

    if (
      text.includes('right')
    ) {
      return <FaArrowRight />
    }

    return <FaArrowUp />
  }

  // =====================================================
  // BUILD ROUTE
  // =====================================================

  const buildRoute = async (
    item
  ) => {

    try {

      const route =
        await getRoute({

          startLat:
            item.lat,

          startLon:
            item.lon,

          endLat:
            data.center[0],

          endLon:
            data.center[1],

          mode:
            travelMode
        })

      if (!route) return

      // ==========================================
      // GEOMETRY
      // ==========================================

      setRouteGeoJSON({

        type: 'Feature',

        geometry:
          route.geometry
      })

      // ==========================================
      // ROUTE INFO
      // ==========================================

      setRouteInfo({

        landmark:
          item.name,

        category:
          item.category,

        provider:
          route.provider,

        mode:
          route.mode,

        distanceKm:

          (
            route.distance_meters / 1000
          ).toFixed(1),

        durationMinutes:

          Math.round(
            route.duration_seconds / 60
          ),

        legs:
          route.legs || []
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

  const flyToLocation = async (
    item
  ) => {

    if (!mapRef.current) return

    mapRef.current.flyTo({

      center: [

        item.lon,

        item.lat
      ],

      zoom: 16,

      pitch: 65,

      bearing: -30,

      duration: 2500
    })

    setPopup(item)

    setSelectedLocation(
      item.category
    )

    await buildRoute(item)
  }

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

      pitch: 50,

      bearing: -20,

      duration: 2000
    })
  }

  // =====================================================
  // TRANSPORT BUTTON
  // =====================================================

  const transportButtonStyle = (
    mode,
    color
  ) => ({

    width: 56,

    height: 56,

    borderRadius: '50%',

    border: 'none',

    cursor: 'pointer',

    background:

      travelMode === mode

        ? color

        : '#252525',

    color:

      travelMode === mode

        ? 'black'

        : 'white',

    fontSize: 22,

    transition:
      'all 0.25s ease',

    boxShadow:

      travelMode === mode

        ? `0 0 18px ${color}`

        : 'none'
  })

  // =====================================================
  // UI
  // =====================================================

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

          width: 370,

          maxHeight: '94vh',

          overflowY: 'auto',

          background:
            'rgba(18,18,18,0.94)',

          color: 'white',

          padding: 18,

          borderRadius: 22,

          backdropFilter:
            'blur(16px)',

          boxShadow:
            '0 10px 40px rgba(0,0,0,0.5)'
        }}
      >

        {/* ============================================= */}
        {/* RETURN */}
        {/* ============================================= */}

        <button

          onClick={returnToParcel}

          style={{

            width: '100%',

            padding: 14,

            borderRadius: 16,

            border: 'none',

            background: '#00ffaa',

            color: 'black',

            fontWeight: 'bold',

            cursor: 'pointer',

            marginBottom: 18
          }}
        >

          <FaHome />

          {' '}

          Return To Parcel

        </button>

        {/* ============================================= */}
        {/* TRANSPORT */}
        {/* ============================================= */}

        <div
          style={{
            marginBottom: 24
          }}
        >

          <div
            style={{
              marginBottom: 12,
              fontWeight: 'bold'
            }}
          >

            Transport Mode

          </div>

          <div
            style={{

              display: 'flex',

              gap: 12
            }}
          >

            <button

              onClick={() =>
                setTravelMode(
                  'driving'
                )
              }

              style={
                transportButtonStyle(
                  'driving',
                  '#00bfff'
                )
              }
            >

              <FaCar />

            </button>

            <button

              onClick={() =>
                setTravelMode(
                  'walking'
                )
              }

              style={
                transportButtonStyle(
                  'walking',
                  '#00ffaa'
                )
              }
            >

              <FaWalking />

            </button>

            <button

              onClick={() =>
                setTravelMode(
                  'bus'
                )
              }

              style={
                transportButtonStyle(
                  'bus',
                  '#ffd700'
                )
              }
            >

              <FaBus />

            </button>

            <button

              onClick={() =>
                setTravelMode(
                  'train'
                )
              }

              style={
                transportButtonStyle(
                  'train',
                  '#ff00ff'
                )
              }
            >

              <FaTrain />

            </button>

          </div>

        </div>

        {/* ============================================= */}
        {/* INFRASTRUCTURE */}
        {/* ============================================= */}

        <h3
          style={{
            marginBottom: 18
          }}
        >

          Infrastructure Intelligence

        </h3>

        {infrastructure.map(
          (item, idx) => (

            <div
              key={idx}
            >

              {/* ======================================= */}
              {/* LANDMARK BUTTON */}
              {/* ======================================= */}

              <button

                onClick={() =>
                  flyToLocation(item)
                }

                style={{

                  width: '100%',

                  textAlign: 'left',

                  marginBottom: 10,

                  padding: 14,

                  borderRadius: 16,

                  border: 'none',

                  cursor: 'pointer',

                  background:

                    selectedLocation === item.category

                      ? '#00ffaa'

                      : '#252525',

                  color:

                    selectedLocation === item.category

                      ? 'black'

                      : 'white',

                  transition:
                    'all 0.25s ease'
                }}
              >

                <div
                  style={{

                    display: 'flex',

                    alignItems: 'center',

                    gap: 10,

                    fontWeight: 'bold'
                  }}
                >

                  {
                    categoryIcon(
                      item.category
                    )
                  }

                  {item.name}

                </div>

                <div
                  style={{

                    marginTop: 6,

                    fontSize: 12,

                    opacity: 0.75
                  }}
                >

                  {item.distance_km} km away

                </div>

              </button>

              {/* ======================================= */}
              {/* ITINERARY BELOW ACTIVE LANDMARK */}
              {/* ======================================= */}

              {routeInfo &&
               routeInfo.landmark === item.name && (

                <div
                  style={{

                    background: '#181818',

                    padding: 12,

                    borderRadius: 16,

                    marginBottom: 16,

                    border:
                      `1px solid ${routeColor()}`
                  }}
                >

                  {/* =================================== */}
                  {/* SUMMARY */}
                  {/* =================================== */}

                  <div
                    style={{
                      marginBottom: 12
                    }}
                  >

                    <div>

                      <strong>
                        {routeInfo.distanceKm} km
                      </strong>

                      {' • '}

                      <strong>
                        {routeInfo.durationMinutes} mins
                      </strong>

                    </div>

                    <div
                      style={{
                        opacity: 0.65,
                        fontSize: 12
                      }}
                    >

                      via {routeInfo.provider}

                    </div>

                  </div>

                  {/* =================================== */}
                  {/* LEGS */}
                  {/* =================================== */}

                  {routeInfo.legs?.map(
                    (leg, i) => (

                      <div

                        key={i}

                        style={{

                          display: 'flex',

                          gap: 12,

                          marginBottom: 14,

                          alignItems: 'flex-start'
                        }}
                      >

                        {/* ===================================== */}
                        {/* TURN ICON */}
                        {/* ===================================== */}

                        <div
                          style={{
                            marginTop: 2,
                            fontSize: 18
                          }}
                        >

                          {turnIcon(
                            leg.instruction
                          )}

                        </div>

                        {/* ===================================== */}
                        {/* TEXT */}
                        {/* ===================================== */}

                        <div
                          style={{
                            flex: 1
                          }}
                        >

                          {/* =============================== */}
                          {/* INSTRUCTION */}
                          {/* =============================== */}

                          <div
                            style={{

                              fontSize: 13,

                              fontWeight: 'bold',

                              lineHeight: 1.4
                            }}
                          >

                            {leg.instruction}

                          </div>

                          {/* =============================== */}
                          {/* STREET */}
                          {/* =============================== */}

                          {leg.street && (

                            <div
                              style={{

                                fontSize: 12,

                                opacity: 0.7,

                                marginTop: 2
                              }}
                            >

                              {leg.street}

                            </div>

                          )}

                          {/* =============================== */}
                          {/* DISTANCE + TIME */}
                          {/* =============================== */}

                          <div
                            style={{

                              marginTop: 4,

                              fontSize: 11,

                              opacity: 0.55
                            }}
                          >

                            {Math.round(
                              leg.distance
                            )} m

                            {' • '}

                            {Math.round(
                              leg.duration / 60
                            )} mins

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              )}

            </div>
          )
        )}

      </div>

      {/* ================================================= */}
      {/* MAP */}
      {/* ================================================= */}

      <Map

        ref={mapRef}

        initialViewState={{

          longitude:
            data.center[1],

          latitude:
            data.center[0],

          zoom: 14,

          pitch: 45,

          bearing: -20
        }}

        mapStyle={mapStyle}

        style={{

          width: '100%',

          height: '1000px',

          borderRadius: 22
        }}
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
              'fill-color': '#00ffaa',
              'fill-opacity': 0.2
            }}
          />

          <Layer
            id="parcel-line"
            type="line"
            paint={{
              'line-color': '#00ffaa',
              'line-width': 4
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

                'line-color':
                  routeColor(),

                'line-width': 6,

                'line-opacity': 0.9
              }}
            />

          </Source>

        )}

        {/* ============================================= */}
        {/* MARKERS */}
        {/* ============================================= */}

        {infrastructure.map(
          (item, idx) => (

            <Marker

              key={idx}

              longitude={item.lon}

              latitude={item.lat}
            >

              <div

                style={{
                  fontSize: 26,
                  cursor: 'pointer'
                }}

                onClick={() =>
                  flyToLocation(item)
                }
              >

                {
                  categoryIcon(
                    item.category
                  )
                }

              </div>

            </Marker>
          )
        )}

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

              <strong>
                {popup.name}
              </strong>

              <div>
                {popup.distance_km} km away
              </div>

            </div>

          </Popup>

        )}

      </Map>

    </div>
  )
}