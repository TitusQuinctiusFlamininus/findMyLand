import requests
from geopy.distance import geodesic

TRANSITLAND_URL = (
    "https://transit.land/api/v2/rest"
)

def nearby_stops(lat, lon):

    url = f"{TRANSITLAND_URL}/stops"

    params = {
        "lat": lat,
        "lon": lon,
        "radius": 5000
    }

    r = requests.get(
        url,
        params=params,
        timeout=20
    )

    data = r.json()

    return data.get("stops", [])

def route(

    start_lon,
    start_lat,

    end_lon,
    end_lat,

    mode="bus"
):

    try:

        start_stops = nearby_stops(
            start_lat,
            start_lon
        )

        end_stops = nearby_stops(
            end_lat,
            end_lon
        )

        if not start_stops:
            return None

        if not end_stops:
            return None

        origin = start_stops[0]
        destination = end_stops[0]

        origin_coords = (
            origin["geometry"]["coordinates"]
        )

        destination_coords = (
            destination["geometry"]["coordinates"]
        )

        distance_km = geodesic(

            (
                origin_coords[1],
                origin_coords[0]
            ),

            (
                destination_coords[1],
                destination_coords[0]
            )

        ).km

        # =====================================
        # REALISTIC TRANSIT SPEEDS
        # =====================================

        if mode == "bus":

            avg_speed_kmh = 22

            transfer_penalty = 12

        elif mode == "train":

            avg_speed_kmh = 45

            transfer_penalty = 8

        elif mode == "subway":

            avg_speed_kmh = 55

            transfer_penalty = 5

        else:

            avg_speed_kmh = 25

            transfer_penalty = 10

        duration_minutes = (

            (distance_km / avg_speed_kmh) * 60

        ) + transfer_penalty

        duration_seconds = (
            duration_minutes * 60
        )

        return {

            "provider": "transitland",

            "mode": mode,

            "distance_meters":
                distance_km * 1000,

            "duration_seconds":
                duration_seconds,

            "nearest_stop": {

                "origin":
                    origin.get("name"),

                "destination":
                    destination.get("name")
            },

            "geometry": {

                "type": "LineString",

                "coordinates": [

                    origin_coords,

                    destination_coords
                ]
            }
        }

    except Exception as e:

        print(
            "TRANSITLAND ERROR:",
            e
        )

        return None