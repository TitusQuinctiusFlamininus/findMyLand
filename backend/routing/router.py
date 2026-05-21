from routing.providers.osrm import (
    route as osrm_route
)

def get_route(
    start_lon,
    start_lat,
    end_lon,
    end_lat,
    mode="driving"
):

    # ----------------------------------
    # Transit modes fallback
    # ----------------------------------

    if mode in ["bus", "train"]:

        # future:
        # Transitland
        # GTFS
        # Google Transit

        mode = "driving"

    return osrm_route(
        start_lon,
        start_lat,
        end_lon,
        end_lat,
        mode
    )