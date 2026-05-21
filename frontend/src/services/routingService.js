import axios from 'axios'

const API_URL =
  'http://localhost:8000'

export async function getRoute({

  startLat,
  startLon,

  endLat,
  endLon,

  mode
}) {

  console.log(
    'REQUESTING ROUTE:',
    mode
  )

  const response =
    await axios.post(

      `${API_URL}/route`,

      {

        start_lat:
          startLat,

        start_lon:
          startLon,

        end_lat:
          endLat,

        end_lon:
          endLon,

        mode
      }
    )

  console.log(
    'ROUTE RESPONSE:',
    response.data
  )

  return response.data
}