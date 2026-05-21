import axios from 'axios'

const API =
  'http://localhost:8000/manual-parcel'

export async function getRoute({

  startLat,
  startLon,

  endLat,
  endLon,

  mode = 'driving'

}) {

  const res = await axios.post(

    `${API}/route`,

    {

      start_lat: startLat,
      start_lon: startLon,

      end_lat: endLat,
      end_lon: endLon,

      mode
    }
  )

  return res.data
}