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
  FaBus
} from 'react-icons/fa'

export default function ParcelMap({ data }) {

  const mapRef = useRef(null)

  const [mapStyle, setMapStyle] = useState(
    'streets'
  )

  const [popup, setPopup] = useState(null)

  // ------------------------------------------------
  // Fly-to animation
  // ------------------------------------------------

  useEffect(() => {

    if (!mapRef.current) return

    mapRef.current.flyTo({
      center: [
        data.center[1],
        data.center[0]
      ],
      zoom: 15,
      duration: 4000
    })

  }, [data])

  // ------------------------------------------------
  // Parcel polygon
  // ------------------------------------------------

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

  // ------------------------------------------------
  // Infrastructure markers
  // ------------------------------------------------

  const infrastructure = []

  if (data.infrastructure?.hospital) {

    infrastructure.push({
      type: 'hospital',
      ...data.infrastructure.hospital
    })
  }

  if (data.infrastructure?.school) {

    infrastructure.push({
      type: 'school',
      ...data.infrastructure.school
    })
  }

  if (data.infrastructure?.bus_stop) {

    infrastructure.push({
      type: 'bus',
      ...data.infrastructure.bus_stop
    })
  }

  // ------------------------------------------------
  // Map style URLs
  // ------------------------------------------------

  const styles = {

    streets:
      'https://api.maptiler.com/maps/streets/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    satellite:
      'https://api.maptiler.com/maps/hybrid/style.json?key=9OLAYy7YFpmPdRnxMmfS',

    dataviz:
      'https://api.maptiler.com/maps/dataviz/style.json?key=9OLAYy7YFpmPdRnxMmfS'
  }

  return (

    <div
      style={{
        position: 'relative'
      }}
    >

      {/* ----------------------------------------- */}
      {/* MAP STYLE SWITCHER */}
      {/* ----------------------------------------- */}

      <div
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 20,
          left: 20,
          background: 'white',
          padding: 10,
          borderRadius: 12,
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.15)'
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
            marginLeft: 10
          }}
        >
          Satellite
        </button>

        <button
          onClick={() =>
            setMapStyle('dataviz')
          }
          style={{
            marginLeft: 10
          }}
        >
          Dataviz
        </button>

      </div>

      {/* ----------------------------------------- */}
      {/* MAP */}
      {/* ----------------------------------------- */}

      <Map

        ref={mapRef}

        initialViewState={{
          longitude: data.center[1],
          latitude: data.center[0],
          zoom: 14,
          pitch: 45,
          bearing: -17
        }}

        style={{
          width: '100%',
          height: '800px',
          borderRadius: '20px'
        }}

        mapStyle={styles[mapStyle]}

      >

        {/* ------------------------------------- */}
        {/* NAVIGATION */}
        {/* ------------------------------------- */}

        <NavigationControl />

        {/* ------------------------------------- */}
        {/* PARCEL */}
        {/* ------------------------------------- */}

        <Source
          id="parcel"
          type="geojson"
          data={polygon}
        >

          {/* Parcel Fill */}

          <Layer
            id="parcel-fill"
            type="fill"
            paint={{
              'fill-color': '#00FF99',
              'fill-opacity': 0.25
            }}
          />

          {/* Parcel Glow */}

          <Layer
            id="parcel-glow"
            type="line"
            paint={{
              'line-color': '#00FF99',
              'line-width': 8,
              'line-opacity': 0.4,
              'line-blur': 4
            }}
          />

          {/* Parcel Outline */}

          <Layer
            id="parcel-outline"
            type="line"
            paint={{
              'line-color': '#00FF99',
              'line-width': 3
            }}
          />

        </Source>

        {/* ------------------------------------- */}
        {/* INFRASTRUCTURE MARKERS */}
        {/* ------------------------------------- */}

        {infrastructure.map(
          (item, idx) => (

            <Marker
              key={idx}
              longitude={
                item.lon ||
                data.center[1]
              }
              latitude={
                item.lat ||
                data.center[0]
              }
            >

              <div
                onClick={() =>
                  setPopup(item)
                }
                style={{
                  cursor: 'pointer',
                  fontSize: 28
                }}
              >

                {item.type === 'hospital' && (
                  <FaHospital color="red" />
                )}

                {item.type === 'school' && (
                  <FaSchool color="blue" />
                )}

                {item.type === 'bus' && (
                  <FaBus color="green" />
                )}

              </div>

            </Marker>

          )
        )}

        {/* ------------------------------------- */}
        {/* POPUP */}
        {/* ------------------------------------- */}

        {popup && (

          <Popup
            longitude={
              popup.lon ||
              data.center[1]
            }
            latitude={
              popup.lat ||
              data.center[0]
            }
            onClose={() =>
              setPopup(null)
            }
          >

            <div>

              <h3>
                {popup.name}
              </h3>

              <p>
                Distance:
                {' '}
                {popup.distance_km} km
              </p>

            </div>

          </Popup>

        )}

      </Map>

    </div>
  )
}