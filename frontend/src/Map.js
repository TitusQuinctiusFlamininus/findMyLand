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

import polyline from '@mapbox/polyline'

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
  FaHome
} from 'react-icons/fa'

export default function ParcelMap({ data }) {

  const mapRef = useRef(null)

  // ====================================================
  // STATE
  // ====================================================

  const [popup, setPopup] = useState(null)

  const [selectedLocation, setSelectedLocation] =
    useState(null)

  const [mapStyle, setMapStyle] =
    useState('dataviz')

  const [routeGeoJSON, setRouteGeoJSON] =
    useState(null)

  const [travelMode, setTravelMode] =
    useState('driving')

  // ====================================================
  // MAP STYLES
  // ====================================================

  const styles = {

    streets:
      'https://api.maptiler.com/maps/streets/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    satellite:
      'https://api.maptiler.com/maps/hybrid/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    dataviz:
      'https://api.maptiler.com/maps/dataviz/style.json?key=9OLAYy7YFpmPdRnxMmfS'
  }

  // ====================================================
  // INFRASTRUCTURE
  // ====================================================

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

  // ====================================================
  // POLYGON
  // ====================================================

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

  // ====================================================
  // INITIAL FLY
  // ====================================================

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

  // ====================================================
  // PULSE CSS
  // ====================================================

  useEffect(() => {

    const style = document.createElement('style')

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

  // ====================================================
  // RETURN TO PARCEL
  // ====================================================

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

    setSelectedLocation(null)

    setPopup(null)

    setRouteGeoJSON(null)
  }

  // ====================================================
  // ROUTING
  // ====================================================

  const buildRoute = async (item) => {

    try {

      let profile = 'driving'

      if (travelMode === 'walking') {
        profile = 'walking'
      }

      if (
        travelMode === 'bus' ||
        travelMode === 'train'
      ) {
        profile = 'driving'
      }

      const url = `
https://router.project-osrm.org/route/v1/${profile}/
${item.lon},${item.lat};
${data.center[1]},${data.center[0]}
?overview=full&geometries=polyline
`

      const res = await fetch(url)

      const json = await res.json()

      if (!json.routes?.length) return

      const decoded = polyline.decode(
        json.routes[0].geometry
      )

      const coordinates = decoded.map(
        ([lat, lon]) => [lon, lat]
      )

      setRouteGeoJSON({

        type: 'Feature',

        geometry: {

          type: 'LineString',

          coordinates
        }
      })

    } catch (err) {

      console.error(err)
    }
  }

  // ====================================================
  // FLY TO LOCATION
  // ====================================================

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

    setSelectedLocation(item.category)

    await buildRoute(item)
  }

  // ====================================================
  // ICONS
  // ====================================================

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
        return <FaUtensils color="darkred" />

      default:
        return '📍'
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

          width: 300,

          maxHeight: 750,

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
        {/* RETURN BUTTON */}
        {/* ============================================= */}

        <button

          onClick={returnToParcel}

          style={{

            width: '100%',

            padding: 16,

            marginBottom: 20,

            borderRadius: 16,

            border: 'none',

            background: '#00FF99',

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
        {/* MAP STYLE */}
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
        {/* TRAVEL MODE */}
        {/* ============================================= */}

        <div
          style={{
            marginBottom: 20
          }}
        >

          <h4>
            Route Mode
          </h4>

          <select

            value={travelMode}

            onChange={(e) =>
              setTravelMode(
                e.target.value
              )
            }

            style={{
              width: '100%',
              padding: 10,
              borderRadius: 10
            }}
          >

            <option value="driving">
              Driving
            </option>

            <option value="walking">
              Walking
            </option>

            <option value="bus">
              Bus
            </option>

            <option value="train">
              Train/Subway
            </option>

          </select>

        </div>

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

              {categoryIcon(item.category)}

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
          height: '900px',
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

                'line-color': '#00BFFF',

                'line-width': 6,

                'line-opacity': 0.85
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

              {categoryIcon(item.category)}

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