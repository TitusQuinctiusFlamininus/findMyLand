import requests

OSRM_URL = (
    "https://router.project-osrm.org"
)

# =========================================================
# BUILD INSTRUCTION
# =========================================================

def build_instruction(step):

    maneuver = (
        step.get("maneuver", {})
    )

    modifier = maneuver.get(
        "modifier",
        ""
    )

    street = step.get(
        "name",
        ""
    )

    maneuver_type = maneuver.get(
        "type",
        ""
    )

    if maneuver_type == "depart":

        return (
            f"Start on {street}"
        )

    if maneuver_type == "arrive":

        return (
            "You have arrived"
        )

    if modifier:

        return (
            f"Turn {modifier} onto {street}"
        )

    return (
        f"Continue on {street}"
    )

# =========================================================
# ROUTE
# =========================================================

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

        "steps": "true",

        "annotations": "true"
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

    navigation_steps = []

    cumulative_duration = 0

    cumulative_distance = 0

    # =====================================================
    # TRUE TURN-BY-TURN
    # =====================================================

    for leg in route["legs"]:

        for step in leg["steps"]:

            distance = step.get(
                "distance",
                0
            )

            duration = step.get(
                "duration",
                0
            )

            cumulative_distance += distance
            cumulative_duration += duration

            navigation_steps.append({

                "mode": mode,

                "instruction":

                    build_instruction(
                        step
                    ),

                "street":

                    step.get(
                        "name"
                    ),

                "distance":
                    distance,

                "duration":
                    duration,

                "cumulative_distance":
                    cumulative_distance,

                "cumulative_duration":
                    cumulative_duration,

                "maneuver":
                    step.get(
                        "maneuver",
                        {}
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
            navigation_steps
    }