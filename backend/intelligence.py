import requests
from geopy.distance import geodesic

OVERPASS_URL = (
    "https://overpass-api.de/api/interpreter"
)

# =====================================================
# OVERPASS QUERY
# =====================================================

def overpass_query(query):

    try:

        r = requests.get(

            OVERPASS_URL,

            params={
                "data": query
            },

            timeout=60
        )

        print("\n====================")
        print("OVERPASS STATUS")
        print("====================")

        print(r.status_code)

        print("\n====================")
        print("OVERPASS RESPONSE")
        print("====================")

        print(r.text[:500])

        # ==========================================
        # RESPONSE VALIDATION
        # ==========================================

        if r.status_code != 200:

            print(
                "OVERPASS BAD STATUS"
            )

            return {}

        if not r.text.strip():

            print(
                "OVERPASS EMPTY RESPONSE"
            )

            return {}

        # ==========================================
        # JSON PARSE
        # ==========================================

        try:

            return r.json()

        except Exception as e:

            print(
                "OVERPASS JSON ERROR:",
                e
            )

            return {}

    except Exception as e:

        print(
            "OVERPASS REQUEST ERROR:",
            e
        )

        return {}

# =====================================================
# FIND NEAREST PLACE
# =====================================================

def find_nearest_place(

    lat,
    lon,

    category,
    overpass_filter
):

    query = f"""

    [out:json];

    (

      node
        {overpass_filter}
        (around:10000,{lat},{lon});

    );

    out body;

    """

    print("\n====================")
    print("OVERPASS QUERY")
    print("====================")
    print(query)

    data = overpass_query(query)

    elements = data.get(
        "elements",
        []
    )

    if not elements:

        return None

    nearest = None
    nearest_distance = 999999

    for el in elements:

        place_lat = el.get("lat")
        place_lon = el.get("lon")

        if (
            place_lat is None or
            place_lon is None
        ):
            continue

        dist = geodesic(

            (lat, lon),

            (place_lat, place_lon)

        ).km

        if dist < nearest_distance:

            nearest_distance = dist

            nearest = {

                "name":

                    el.get(
                        "tags",
                        {}
                    ).get(
                        "name",
                        category
                    ),

                "lat":
                    place_lat,

                "lon":
                    place_lon,

                "distance_km":
                    round(dist, 2)
            }

    return nearest

# =====================================================
# LAND INTELLIGENCE
# =====================================================

def generate_land_intelligence(
    lat,
    lon
):

    return {

        "hospital":

            find_nearest_place(

                lat,
                lon,

                "hospital",

                '["amenity"="hospital"]'
            ),

        "school":

            find_nearest_place(

                lat,
                lon,

                "school",

                '["amenity"="school"]'
            ),

        "bus_stop":

            find_nearest_place(

                lat,
                lon,

                "bus_stop",

                '["highway"="bus_stop"]'
            ),

        "railway":

            find_nearest_place(

                lat,
                lon,

                "railway",

                '["railway"="station"]'
            ),

        "restaurant":

            find_nearest_place(

                lat,
                lon,

                "restaurant",

                '["amenity"="restaurant"]'
            ),

        "pharmacy":

            find_nearest_place(

                lat,
                lon,

                "pharmacy",

                '["amenity"="pharmacy"]'
            ),

        "fuel":

            find_nearest_place(

                lat,
                lon,

                "fuel",

                '["amenity"="fuel"]'
            ),

        "bank":

            find_nearest_place(

                lat,
                lon,

                "bank",

                '["amenity"="bank"]'
            ),

        "supermarket":

            find_nearest_place(

                lat,
                lon,

                "supermarket",

                '["shop"="supermarket"]'
            ),

        "park":

            find_nearest_place(

                lat,
                lon,

                "park",

                '["leisure"="park"]'
            ),

        "police":

            find_nearest_place(

                lat,
                lon,

                "police",

                '["amenity"="police"]'
            ),

        "fire_station":

            find_nearest_place(

                lat,
                lon,

                "fire_station",

                '["amenity"="fire_station"]'
            ),

        "airport":

            find_nearest_place(

                lat,
                lon,

                "airport",

                '["aeroway"="aerodrome"]'
            ),

        "hotel":

            find_nearest_place(

                lat,
                lon,

                "hotel",

                '["tourism"="hotel"]'
            ),

        "university":

            find_nearest_place(

                lat,
                lon,

                "university",

                '["amenity"="university"]'
            )
    }