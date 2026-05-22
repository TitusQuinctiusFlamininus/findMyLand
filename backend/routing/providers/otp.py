import requests

OTP_URL = (
    "http://localhost:8080"
)

def route(

    start_lon,
    start_lat,

    end_lon,
    end_lat,

    mode="TRANSIT"
):

    print("\n====================")
    print("OTP ROUTE CALLED")
    print("====================")

    try:

        url = (
            f"{OTP_URL}/otp/routers/default/plan"
        )

        params = {

            "fromPlace":
                f"{start_lat},{start_lon}",

            "toPlace":
                f"{end_lat},{end_lon}",

            "mode": mode,

            "numItineraries": 1
        }

        r = requests.get(

            url,

            params=params,

            timeout=30
        )

        print(
            "OTP STATUS:",
            r.status_code
        )

        data = r.json()

        if "plan" not in data:

            print(data)

            return None

        itineraries = (
            data["plan"]
            .get("itineraries", [])
        )

        if not itineraries:
            return None

        itinerary = itineraries[0]

        # ==========================================
        # FULL LEG EXTRACTION
        # ==========================================

        legs = []

        geometry_coordinates = []

        for leg in itinerary["legs"]:

            leg_data = {

                "mode":
                    leg.get("mode"),

                "route":
                    leg.get("route"),

                "agency":
                    leg.get("agencyName"),

                "distance":
                    leg.get("distance"),

                "duration":
                    leg.get("duration"),

                "startTime":
                    leg.get("startTime"),

                "endTime":
                    leg.get("endTime"),

                "instruction":

                    f"{leg.get('mode')} from "

                    f"{leg['from'].get('name')} "

                    f"to "

                    f"{leg['to'].get('name')}",

                "from": {

                    "name":

                        leg["from"].get(
                            "name"
                        ),

                    "lat":

                        leg["from"].get(
                            "lat"
                        ),

                    "lon":

                        leg["from"].get(
                            "lon"
                        )
                },

                "to": {

                    "name":

                        leg["to"].get(
                            "name"
                        ),

                    "lat":

                        leg["to"].get(
                            "lat"
                        ),

                    "lon":

                        leg["to"].get(
                            "lon"
                        )
                }
            }

            legs.append(
                leg_data
            )

            geometry_coordinates.append([

                leg["from"]["lon"],
                leg["from"]["lat"]
            ])

            geometry_coordinates.append([

                leg["to"]["lon"],
                leg["to"]["lat"]
            ])

        return {

            "provider": "otp",

            "mode": mode,

            "distance_meters":

                itinerary.get(
                    "walkDistance",
                    0
                ),

            "duration_seconds":

                itinerary.get(
                    "duration",
                    0
                ),

            "geometry": {

                "type": "LineString",

                "coordinates":
                    geometry_coordinates
            },

            "legs":
                legs
        }

    except Exception as e:

        print(
            "OTP ERROR:",
            e
        )

        return None