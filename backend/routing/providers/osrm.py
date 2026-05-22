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

        "geometries": "geojson",

        "steps": "true"
    }

    r = requests.get(

        url,

        params=params,

        timeout=30
    )

    data = r.json()

    if not data.get("routes"):

        return None

    route = data["routes"][0]

    legs = []

    # ==========================================
    # STEP EXTRACTION
    # ==========================================

    for leg in route["legs"]:

        for step in leg["steps"]:

            maneuver = (
                step.get("maneuver", {})
            )

            legs.append({

                "mode": mode,

                "instruction":

                    maneuver.get(
                        "instruction"
                    ),

                "name":
                    step.get("name"),

                "distance":
                    step.get("distance"),

                "duration":
                    step.get("duration"),

                "type":
                    maneuver.get("type"),

                "modifier":
                    maneuver.get(
                        "modifier"
                    )
            })

    return {

        "provider": "osrm",

        "mode": mode,

        "distance_meters":
            route["distance"],

        "duration_seconds":
            route["duration"],

        "geometry":
            route["geometry"],

        "legs":
            legs
    }