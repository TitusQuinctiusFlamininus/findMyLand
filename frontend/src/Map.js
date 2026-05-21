import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Popup
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'

export default function Map({ data }) {

  // -----------------------------------
  // Determine map center safely
  // -----------------------------------

  let center = [0, 0]

  if (data.center) {

    center = data.center

  } else if (data.detected_location) {

    center = [
      data.detected_location.lat,
      data.detected_location.lon
    ]
  }

  // -----------------------------------
  // Normalize coordinates
  // -----------------------------------

  const polygonPositions = data.coordinates || []

  return (

    <MapContainer
      center={center}
      zoom={14}
      style={{
        height: '600px',
        width: '100%'
      }}
    >

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {polygonPositions.length > 0 && (

        <Polygon
          positions={polygonPositions}
        />

      )}

      <Marker position={center}>

        <Popup>
          Parcel Center
        </Popup>

      </Marker>

    </MapContainer>
  )
}