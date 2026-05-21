import requests

OSRM_URL = (
    "https://router.project-osrm.org"
)

def route(
    start_lon,
    start_lat,
    end_lon,
    end_lat,
    mode="driving"
):

    profile = "driving"

    if mode == "walking":
        profile = "walking"

    url = (
        f"{OSRM_URL}/route/v1/"
        f"{profile}/"
        f"{start_lon},{start_lat};"
        f"{end_lon},{end_lat}"
    )

    params = {
        "overview": "full",
        "geometries": "geojson"
    }

    r = requests.get(
        url,
        params=params,
        timeout=20
    )

    data = r.json()

    if not data.get("routes"):
        return None

    route = data["routes"][0]

    return {

        "provider": "osrm",

        "distance_meters":
            route["distance"],

        "duration_seconds":
            route["duration"],

        "geometry":
            route["geometry"]
    }