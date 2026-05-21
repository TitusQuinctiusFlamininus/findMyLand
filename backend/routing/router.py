from routing.providers.osrm import (
    route as osrm_route
)

from routing.providers.otp import (
    route as otp_route
)

def get_route(

    start_lon,
    start_lat,

    end_lon,
    end_lat,

    mode="driving"
):

    print("ROUTING MODE:", mode)

    # =====================================
    # DRIVING
    # =====================================

    if mode == "driving":

        return osrm_route(

            start_lon,
            start_lat,

            end_lon,
            end_lat,

            "driving"
        )

    # =====================================
    # WALKING
    # =====================================

    if mode == "walking":

        return osrm_route(

            start_lon,
            start_lat,

            end_lon,
            end_lat,

            "walking"
        )

    # =====================================
    # BUS
    # =====================================

    if mode == "bus":

        result = otp_route(

            start_lon,
            start_lat,

            end_lon,
            end_lat,

            "TRANSIT"
        )

        if result:
            return result

    # =====================================
    # TRAIN
    # =====================================

    if mode == "train":

        result = otp_route(

            start_lon,
            start_lat,

            end_lon,
            end_lat,

            "RAIL"
        )

        if result:
            return result

    # =====================================
    # FALLBACK
    # =====================================

    return osrm_route(

        start_lon,
        start_lat,

        end_lon,
        end_lat,

        "driving"
    )