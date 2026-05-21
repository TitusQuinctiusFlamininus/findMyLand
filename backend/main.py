from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pdf2image import convert_from_bytes
from PIL import Image

from shapely.geometry import Polygon
from geopy.distance import geodesic

import pytesseract
import requests
import re
import cv2
import numpy as np

# =========================================================
# FASTAPI
# =========================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# MODELS
# =========================================================

class Coordinate(BaseModel):
    lat: float
    lon: float


class ParcelRequest(BaseModel):
    coordinates: list[Coordinate]

# =========================================================
# HELPERS
# =========================================================

def calculate_center(coords):

    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lon = sum(c[1] for c in coords) / len(coords)

    return (avg_lat, avg_lon)


def polygon_area(coords):

    if len(coords) < 3:
        return 0

    poly = Polygon([
        (lon, lat)
        for lat, lon in coords
    ])

    return poly.area


def parse_coordinate_text(text):

    coords = []

    lines = text.strip().split("\n")

    for line in lines:

        line = line.strip()

        if not line:
            continue

        parts = line.split(",")

        if len(parts) != 2:
            continue

        lat = float(parts[0].strip())
        lon = float(parts[1].strip())

        coords.append((lat, lon))

    return coords

# =========================================================
# OVERPASS
# =========================================================

def nearest_place(lat, lon, amenity):

    # -----------------------------------------
    # TOWNS
    # -----------------------------------------

    if amenity == "town":

        query = f"""
        [out:json];
        (
          node["place"="town"](around:20000,{lat},{lon});
          node["place"="city"](around:20000,{lat},{lon});
        );
        out center;
        """

    # -----------------------------------------
    # BUS STOPS
    # -----------------------------------------

    elif amenity == "bus_station":

        query = f"""
        [out:json];
        (
          node["highway"="bus_stop"](around:10000,{lat},{lon});
          node["public_transport"="platform"](around:10000,{lat},{lon});
        );
        out center;
        """

    # -----------------------------------------
    # AIRPORTS
    # -----------------------------------------

    elif amenity == "airport":

        query = f"""
        [out:json];
        (
          node["aeroway"="aerodrome"](around:50000,{lat},{lon});
          way["aeroway"="aerodrome"](around:50000,{lat},{lon});
        );
        out center;
        """

    # -----------------------------------------
    # RAILWAY
    # -----------------------------------------

    elif amenity == "railway_station":

        query = f"""
        [out:json];
        (
          node["railway"="station"](around:10000,{lat},{lon});
          way["railway"="station"](around:10000,{lat},{lon});
        );
        out center;
        """

    # -----------------------------------------
    # PARKS
    # -----------------------------------------

    elif amenity == "park":

        query = f"""
        [out:json];
        (
          way["leisure"="park"](around:10000,{lat},{lon});
        );
        out center;
        """

    # -----------------------------------------
    # DEFAULT
    # -----------------------------------------

    else:

        query = f"""
        [out:json];
        (
          node["amenity"="{amenity}"](around:10000,{lat},{lon});
          way["amenity"="{amenity}"](around:10000,{lat},{lon});
          relation["amenity"="{amenity}"](around:10000,{lat},{lon});
        );
        out center;
        """

    print(query)

    url = "https://overpass-api.de/api/interpreter"

    try:

        r = requests.get(
            url,
            params={"data": query},
            headers={
                "User-Agent": "findmyland/0.1"
            },
            timeout=20
        )

        if r.status_code != 200:
            return None

        data = r.json()

        if not data.get("elements"):
            return None

        place = data["elements"][0]

        if "lat" in place:

            place_lat = place["lat"]
            place_lon = place["lon"]

        elif "center" in place:

            place_lat = place["center"]["lat"]
            place_lon = place["center"]["lon"]

        else:
            return None

        distance = geodesic(
            (lat, lon),
            (place_lat, place_lon)
        ).km

        return {

            "name": place.get(
                "tags",
                {}
            ).get(
                "name",
                amenity
            ),

            "distance_km": round(distance, 2),

            "lat": place_lat,

            "lon": place_lon,

            "type": amenity
        }

    except Exception as e:

        print("OVERPASS ERROR:", e)

        return None

# =========================================================
# ROADS
# =========================================================

def nearest_road(lat, lon):

    query = f"""
    [out:json];
    (
      way["highway"](around:5000,{lat},{lon});
    );
    out center;
    """

    url = "https://overpass-api.de/api/interpreter"

    try:

        r = requests.get(
            url,
            params={"data": query},
            headers={
                "User-Agent": "findmyland/0.1"
            },
            timeout=20
        )

        if r.status_code != 200:
            return None

        data = r.json()

        if not data.get("elements"):
            return None

        road = data["elements"][0]

        center = road.get("center")

        if not center:
            return None

        distance = geodesic(
            (lat, lon),
            (
                center["lat"],
                center["lon"]
            )
        ).km

        return {

            "distance_km": round(distance, 2),

            "road_type": road.get(
                "tags",
                {}
            ).get(
                "highway",
                "road"
            ),

            "lat": center["lat"],

            "lon": center["lon"]
        }

    except Exception as e:

        print("ROAD ERROR:", e)

        return None

# =========================================================
# INTELLIGENCE
# =========================================================

def infrastructure_intelligence(lat, lon):

    categories = {

        "hospital": "hospital",
        "school": "school",
        "pharmacy": "pharmacy",
        "police": "police",
        "fire_station": "fire_station",

        "bus_stop": "bus_station",
        "airport": "airport",
        "railway": "railway_station",

        "bank": "bank",
        "fuel": "fuel",
        "supermarket": "supermarket",
        "restaurant": "restaurant",
        "hotel": "hotel",

        "town": "town",
        "university": "university",

        "park": "park"
    }

    results = {}

    for label, amenity in categories.items():

        place = nearest_place(
            lat,
            lon,
            amenity
        )

        results[label] = place

    return results


def land_intelligence_summary(
    infrastructure,
    road
):

    score = 0

    insights = []

    if infrastructure.get("hospital"):
        score += 1
        insights.append(
            "Healthcare nearby"
        )

    if infrastructure.get("school"):
        score += 1
        insights.append(
            "Education access"
        )

    if infrastructure.get("bus_stop"):
        score += 2
        insights.append(
            "Transit connectivity"
        )

    if road:
        score += 2
        insights.append(
            "Road access available"
        )

    classification = "Rural"

    if score >= 5:
        classification = (
            "High Development Potential"
        )

    elif score >= 3:
        classification = "Peri-Urban"

    return {
        "score": score,
        "classification": classification,
        "insights": insights
    }

# =========================================================
# ROUTES
# =========================================================

@app.get("/")
async def root():

    return {
        "message": "findMyLand running"
    }

# =========================================================
# MANUAL PARCEL
# =========================================================

@app.post("/manual-parcel")
async def manual_parcel(
    parcel: ParcelRequest
):

    coords = [
        (c.lat, c.lon)
        for c in parcel.coordinates
    ]

    if coords[0] != coords[-1]:
        coords.append(coords[0])

    center = calculate_center(coords)

    area = polygon_area(coords)

    infrastructure = (
        infrastructure_intelligence(
            center[0],
            center[1]
        )
    )

    road = nearest_road(
        center[0],
        center[1]
    )

    intelligence = (
        land_intelligence_summary(
            infrastructure,
            road
        )
    )

    return {

        "coordinates": coords,

        "center": center,

        "area_estimate": area,

        "infrastructure": infrastructure,

        "road_access": road,

        "intelligence": intelligence
    }

# =========================================================
# TXT COORD UPLOAD
# =========================================================

@app.post("/upload-coordinates")
async def upload_coordinates(
    file: UploadFile = File(...)
):

    content = await file.read()

    text = content.decode("utf-8")

    coords = parse_coordinate_text(text)

    if coords[0] != coords[-1]:
        coords.append(coords[0])

    center = calculate_center(coords)

    area = polygon_area(coords)

    infrastructure = (
        infrastructure_intelligence(
            center[0],
            center[1]
        )
    )

    road = nearest_road(
        center[0],
        center[1]
    )

    intelligence = (
        land_intelligence_summary(
            infrastructure,
            road
        )
    )

    return {

        "coordinates": coords,

        "center": center,

        "area_estimate": area,

        "infrastructure": infrastructure,

        "road_access": road,

        "intelligence": intelligence
    }