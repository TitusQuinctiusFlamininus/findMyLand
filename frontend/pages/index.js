import { useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('../src/Map'),
  {
    ssr: false,
  }
)

export default function Home() {

  // --------------------------------------------------
  // STATE
  // --------------------------------------------------

  const [file, setFile] = useState(null)

  const [coordFile, setCoordFile] = useState(null)

  const [result, setResult] = useState(null)

  const [loading, setLoading] = useState(false)

  const [coordinates, setCoordinates] = useState([
    { lat: '', lon: '' },
    { lat: '', lon: '' },
    { lat: '', lon: '' },
    { lat: '', lon: '' }
  ])

  // --------------------------------------------------
  // DOCUMENT OCR UPLOAD
  // --------------------------------------------------

  const upload = async () => {

    if (!file) {
      alert('Select a file first')
      return
    }

    const formData = new FormData()

    formData.append('file', file)

    try {

      setLoading(true)

      const res = await axios.post(
        'http://localhost:8000/upload',
        formData
      )

      setResult(res.data)

    } catch (err) {

      console.error(err)

      alert(
        err.response?.data?.detail ||
        err.message ||
        'Upload failed'
      )

    } finally {

      setLoading(false)
    }
  }

  // --------------------------------------------------
  // MANUAL COORDINATE ENTRY
  // --------------------------------------------------

  const updateCoordinate = (
    index,
    field,
    value
  ) => {

    const updated = [...coordinates]

    updated[index][field] = value

    setCoordinates(updated)
  }

  const submitManualCoordinates = async () => {

    try {

      const payload = {
        coordinates: coordinates.map(c => ({
          lat: parseFloat(c.lat),
          lon: parseFloat(c.lon)
        }))
      }

      setLoading(true)

      const res = await axios.post(
        'http://localhost:8000/manual-parcel',
        payload
      )

      setResult(res.data)

    } catch (err) {

      console.error(err)

      alert(
        err.response?.data?.detail ||
        err.message ||
        'Failed to process parcel'
      )

    } finally {

      setLoading(false)
    }
  }

  // --------------------------------------------------
  // TXT COORDINATE FILE UPLOAD
  // --------------------------------------------------

  const uploadCoordinateFile = async () => {

    if (!coordFile) {

      alert('Select coordinate file')

      return
    }

    const formData = new FormData()

    formData.append('file', coordFile)

    try {

      setLoading(true)

      const res = await axios.post(
        'http://localhost:8000/upload-coordinates',
        formData
      )

      setResult(res.data)

    } catch (err) {

      console.error(err)

      alert(
        err.response?.data?.detail ||
        err.message ||
        'Coordinate upload failed'
      )

    } finally {

      setLoading(false)
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (

    <div
      style={{
        padding: 20,
        fontFamily: 'Arial',
        maxWidth: 1200,
        margin: '0 auto'
      }}
    >

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <h1>findMyLand MVP</h1>

      <p>
        Upload land coordinates or a cadastral
        document to generate parcel intelligence.
      </p>

      {/* -------------------------------------------------- */}
      {/* DOCUMENT UPLOAD */}
      {/* -------------------------------------------------- */}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 10,
          padding: 20,
          marginBottom: 30
        }}
      >

        <h2>Upload Cadastral Document</h2>

        <p>
          PDF/image OCR workflow.
        </p>

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <br />
        <br />

        <button onClick={upload}>
          Upload & Analyze
        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* MANUAL COORDINATES */}
      {/* -------------------------------------------------- */}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 10,
          padding: 20,
          marginBottom: 30
        }}
      >

        <h2>Manual Coordinates</h2>

        <p>
          Enter 4 parcel corner coordinates.
        </p>

        {coordinates.map((coord, index) => (

          <div
            key={index}
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 10
            }}
          >

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={coord.lat}
              onChange={(e) =>
                updateCoordinate(
                  index,
                  'lat',
                  e.target.value
                )
              }
              style={{
                width: 220,
                padding: 10
              }}
            />

            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={coord.lon}
              onChange={(e) =>
                updateCoordinate(
                  index,
                  'lon',
                  e.target.value
                )
              }
              style={{
                width: 220,
                padding: 10
              }}
            />

          </div>

        ))}

        <br />

        <button onClick={submitManualCoordinates}>
          Analyze Manual Parcel
        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* TXT FILE COORDINATE UPLOAD */}
      {/* -------------------------------------------------- */}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 10,
          padding: 20,
          marginBottom: 30
        }}
      >

        <h2>Upload Coordinate TXT File</h2>

        <p>
          Upload a .txt file with one coordinate
          pair per line (For example, see below).
        </p>

        <pre
          style={{
            background: '#f5f5f5',
            padding: 15,
            overflowX: 'auto'
          }}
        >
{`-1.2921,36.8219
-1.2925,36.8230
-1.2935,36.8225
-1.2930,36.8215`}
        </pre>

        <input
          type="file"
          accept=".txt"
          onChange={(e) =>
            setCoordFile(e.target.files[0])
          }
        />

        <br />
        <br />

        <button onClick={uploadCoordinateFile}>
          Upload Coordinate File
        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* LOADING */}
      {/* -------------------------------------------------- */}

      {loading && (

        <div
          style={{
            background: '#f5f5f5',
            padding: 20,
            marginBottom: 20,
            borderRadius: 10
          }}
        >

          Analyzing parcel intelligence...

        </div>

      )}

      {/* -------------------------------------------------- */}
      {/* RESULTS */}
      {/* -------------------------------------------------- */}

      {result && (

        <div>

          <h2>Parcel Intelligence</h2>

          {/* ------------------------------------------ */}
          {/* MAP */}
          {/* ------------------------------------------ */}

          <div
            style={{
              marginBottom: 30
            }}
          >

            <Map data={result} />

          </div>

          {/* ------------------------------------------ */}
          {/* RAW JSON */}
          {/* ------------------------------------------ */}

          <div
            style={{
              background: '#f8f8f8',
              padding: 20,
              marginBottom: 30,
              borderRadius: 10,
              overflowX: 'auto'
            }}
          >

            <h3>Raw Response</h3>

            <pre>
              {JSON.stringify(
                result,
                null,
                2
              )}
            </pre>

          </div>

          {/* ------------------------------------------ */}
          {/* INTELLIGENCE OVERLAY */}
          {/* ------------------------------------------ */}

          {result.intelligence && (

            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 10,
                padding: 20,
                background: '#fafafa',
                marginBottom: 30
              }}
            >

              <h2>
                Intelligence Overlay
              </h2>

              {/* ---------------------------------- */}
              {/* CLASSIFICATION */}
              {/* ---------------------------------- */}

              <div
                style={{
                  marginBottom: 20
                }}
              >

                <h3>
                  Classification
                </h3>

                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}
                >
                  {
                    result.intelligence
                      .classification
                  }
                </p>

              </div>

              {/* ---------------------------------- */}
              {/* SCORE */}
              {/* ---------------------------------- */}

              <div
                style={{
                  marginBottom: 20
                }}
              >

                <h3>
                  Development Score
                </h3>

                <p
                  style={{
                    fontSize: 20
                  }}
                >
                  {
                    result.intelligence
                      .score
                  }
                  {' '} / 10
                </p>

              </div>

              {/* ---------------------------------- */}
              {/* INSIGHTS */}
              {/* ---------------------------------- */}

              <div
                style={{
                  marginBottom: 20
                }}
              >

                <h3>Insights</h3>

                <ul>

                  {result.intelligence.insights.map(
                    (insight, idx) => (

                      <li key={idx}>
                        {insight}
                      </li>

                    )
                  )}

                </ul>

              </div>

              {/* ---------------------------------- */}
              {/* INFRASTRUCTURE */}
              {/* ---------------------------------- */}

              <div
                style={{
                  marginBottom: 20
                }}
              >

                <h3>
                  Nearby Infrastructure
                </h3>

                <pre>
                  {JSON.stringify(
                    result.infrastructure,
                    null,
                    2
                  )}
                </pre>

              </div>

              {/* ---------------------------------- */}
              {/* ROAD ACCESS */}
              {/* ---------------------------------- */}

              <div>

                <h3>Road Access</h3>

                <pre>
                  {JSON.stringify(
                    result.road_access,
                    null,
                    2
                  )}
                </pre>

              </div>

            </div>

          )}

        </div>

      )}

    </div>
  )
}