import { useEffect, useRef, useState } from 'react'

import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl
} from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

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
  FaClinicMedical,
  FaUtensils,
  FaLandmark,
  FaBriefcaseMedical
} from 'react-icons/fa'

export default function ParcelMap({ data }) {

  const mapRef = useRef(null)

  const [popup, setPopup] = useState(null)

  const [selectedLocation, setSelectedLocation] =
    useState(null)

  const [mapStyle, setMapStyle] =
    useState('dataviz')

  // =====================================================
  // STYLES
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
  // MAP FLYTO
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
  // PULSE CSS
  // =====================================================

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

  // =====================================================
  // FLY TO LOCATION
  // =====================================================

  const flyToLocation = (item) => {

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
  }

  // =====================================================
  // ICONS
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
        return <FaClinicMedical color="teal" />

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

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <div
        style={{

          position: 'absolute',

          left: 20,

          top: 20,

          zIndex: 10,

          width: 280,

          maxHeight: 700,

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

        <h2>
          Intelligence
        </h2>

        {/* MAP STYLE */}

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

        {/* INFRASTRUCTURE */}

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

      {/* ========================================= */}
      {/* MAP */}
      {/* ========================================= */}

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
          height: '850px',
          borderRadius: '20px'
        }}

        mapStyle={styles[mapStyle]}
      >

        <NavigationControl />

        {/* PARCEL */}

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

        {/* MARKERS */}

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

        {/* POPUP */}

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