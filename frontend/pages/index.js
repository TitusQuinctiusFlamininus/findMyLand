import { useState } from 'react'

import axios from 'axios'

import dynamic from 'next/dynamic'

const ParcelMap = dynamic(

  () => import('../src/Map'),

  {
    ssr: false
  }
)

export default function Home() {

  // =====================================================
  // STATE
  // =====================================================

  const [coordinatesText, setCoordinatesText] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState(null)

  const [mapData, setMapData] =
    useState(null)

  // =====================================================
  // PARSE COORDINATES
  // =====================================================

  const parseCoordinates = (text) => {

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    const coordinates = []

    for (const line of lines) {

      const parts = line
        .split(',')

      if (parts.length !== 2) {
        continue
      }

      const lat = parseFloat(
        parts[0].trim()
      )

      const lon = parseFloat(
        parts[1].trim()
      )

      if (
        isNaN(lat) ||
        isNaN(lon)
      ) {
        continue
      }

      coordinates.push([
        lat,
        lon
      ])
    }

    return coordinates
  }

  // =====================================================
  // UPLOAD COORDINATES FILE
  // =====================================================

  const handleFileUpload = async (
    event
  ) => {

    const file =
      event.target.files[0]

    if (!file) return

    const text =
      await file.text()

    setCoordinatesText(text)
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async () => {

    setError(null)

    const coordinates =
      parseCoordinates(
        coordinatesText
      )

    if (coordinates.length < 4) {

      setError(
        'Please provide at least 4 coordinate lines.'
      )

      return
    }

    try {

      setLoading(true)

      console.log(
        'SENDING COORDINATES:',
        coordinates
      )

      // ==========================================
      // BACKEND REQUEST
      // ==========================================

      const response =
        await axios.post(

          'http://localhost:8000/manual-parcel',

          {
            coordinates
          }
        )

      console.log(
        'BACKEND RESPONSE:',
        response.data
      )

      setMapData(
        response.data
      )

    } catch (err) {

      console.error(err)

      setError(
        'Failed to analyze parcel.'
      )

    } finally {

      setLoading(false)
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      style={{
        padding: 30,
        fontFamily: 'Arial'
      }}
    >

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <h1
        style={{
          fontSize: 40,
          marginBottom: 10
        }}
      >

        FindMyLand

      </h1>

      <p
        style={{
          marginBottom: 30,
          color: '#666'
        }}
      >

        Upload parcel coordinates and
        explore infrastructure,
        routing intelligence,
        transport access,
        and nearby amenities.

      </p>

      {/* ============================================= */}
      {/* INPUT PANEL */}
      {/* ============================================= */}

      <div
        style={{

          background: '#f5f5f5',

          padding: 25,

          borderRadius: 20,

          marginBottom: 30
        }}
      >

        {/* ========================================= */}
        {/* FILE UPLOAD */}
        {/* ========================================= */}

        <div
          style={{
            marginBottom: 20
          }}
        >

          <h3>
            Upload Coordinates File
          </h3>

          <p>
            Text file format:
          </p>

          <pre
            style={{

              background: 'white',

              padding: 15,

              borderRadius: 10
            }}
          >

{`52.5200,13.4050
52.5205,13.4060
52.5195,13.4065
52.5190,13.4055`}

          </pre>

          <input

            type="file"

            accept=".txt"

            onChange={
              handleFileUpload
            }
          />

        </div>

        {/* ========================================= */}
        {/* TEXTAREA */}
        {/* ========================================= */}

        <div
          style={{
            marginBottom: 20
          }}
        >

          <h3>
            Or Paste Coordinates
          </h3>

          <textarea

            value={coordinatesText}

            onChange={(e) =>
              setCoordinatesText(
                e.target.value
              )
            }

            rows={10}

            placeholder={
              'latitude,longitude'
            }

            style={{

              width: '100%',

              padding: 15,

              borderRadius: 10,

              border:
                '1px solid #ccc',

              fontFamily:
                'monospace',

              fontSize: 14
            }}
          />

        </div>

        {/* ========================================= */}
        {/* BUTTON */}
        {/* ========================================= */}

        <button

          onClick={handleSubmit}

          disabled={loading}

          style={{

            padding:
              '16px 32px',

            background:
              '#00cc88',

            color: 'white',

            border: 'none',

            borderRadius: 12,

            cursor: 'pointer',

            fontSize: 18,

            fontWeight: 'bold'
          }}
        >

          {loading

            ? 'Analyzing Parcel...'

            : 'Analyze Land'}

        </button>

        {/* ========================================= */}
        {/* ERROR */}
        {/* ========================================= */}

        {error && (

          <div
            style={{

              marginTop: 20,

              color: 'red',

              fontWeight: 'bold'
            }}
          >

            {error}

          </div>

        )}

      </div>

      {/* ============================================= */}
      {/* MAP */}
      {/* ============================================= */}

      {mapData && (

        <ParcelMap
          data={mapData}
        />

      )}

    </div>
  )
}