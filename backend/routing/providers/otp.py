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

    print("\n==============================")
    print("OTP ROUTE CALLED")
    print("==============================")

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

        coordinates = []

        for leg in itinerary["legs"]:

            coordinates.append([

                leg["from"]["lon"],
                leg["from"]["lat"]
            ])

            coordinates.append([

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

                "coordinates": coordinates
            },

            "legs":
                itinerary.get(
                    "legs",
                    []
                )
        }

    except Exception as e:

        print(
            "OTP ERROR:",
            e
        )

        return None