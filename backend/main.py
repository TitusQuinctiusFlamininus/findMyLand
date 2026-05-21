from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_bytes
from PIL import Image
import pytesseract
import re
from shapely.geometry import Polygon
from geopy.distance import geodesic
import requests
import cv2
import numpy as np
from pydantic import BaseModel

class Coordinate(BaseModel):
    lat: float
    lon: float


class ParcelRequest(BaseModel):
    coordinates: list[Coordinate]

def calculate_center(coords):

    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lon = sum(c[1] for c in coords) / len(coords)

    return (avg_lat, avg_lon)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def geocode_place(place_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
    "q": place_name,
    "format": "json",
    "limit": 1
    }
    headers = {
    "User-Agent": "findmyland"
    }
    r = requests.get(url, params=params, headers=headers)
    data = r.json()
    if not data:
        return None
    return {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"])
    }

def extract_place_names(text):
    candidates = []
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if len(line) > 4 and len(line) < 40:
            if line.isupper():
                candidates.append(line)
    return list(set(candidates))

def extract_lot_labels(text):
    pattern = r"Lot\s+\d+"
    return re.findall(pattern, text, re.IGNORECASE)

def detect_polygons(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(edges,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
    polygons = []

    for contour in contours:
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        area = cv2.contourArea(contour)

        if len(approx) >= 4 and area > 1000:
            points = []
            
            for point in approx:
                x, y = point[0]
                points.append((int(x), int(y)))
            polygons.append(points)
    return polygons

def pdf_first_page_image(content):
    pages = convert_from_bytes(content)
    page = pages[0]
    return np.array(page)

def extract_coordinates(text):
    """
    Example supported format:
    1.2921, 36.8219
    """

    pattern = r"(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)"
    matches = re.findall(pattern, text)

    coords = []

    for lat, lon in matches:
        coords.append((float(lat), float(lon)))

    return coords


def polygon_area(coords):
    if len(coords) < 3:
        return 0

    poly = Polygon([(lon, lat) for lat, lon in coords])

    return poly.area

def nearest_place(lat, lon, amenity):

    query = f"""
    [out:json];
    (
      node["amenity"="{amenity}"](around:10000,{lat},{lon});
    );
    out center 1;
    """

    print("\n==========================")
    print("OVERPASS QUERY")
    print("==========================")
    print(query)

    print("\nCURL TEST COMMAND")
    print("==========================")

    curl_command = f'''
curl -G "https://overpass-api.de/api/interpreter" \
  --data-urlencode 'data={query}'
'''

    print(curl_command)

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

        print("STATUS:", r.status_code)
        print("BODY:", r.text[:500])

        data = r.json()

        if not data.get("elements"):
            return None

        place = data["elements"][0]

        place_lat = place["lat"]
        place_lon = place["lon"]

        distance = geodesic(
            (lat, lon),
            (place_lat, place_lon)
        ).km

        return {
            "name": place.get(
                "tags",
                {}
            ).get("name", amenity),

            "distance_km": round(distance, 2)
        }

    except Exception as e:

        print("OVERPASS ERROR:", e)

        return None

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

def infrastructure_intelligence(lat, lon):

    categories = {
        "hospital": "hospital",
        "school": "school",
        "bus_stop": "bus_station",
        "town": "townhall"
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

def nearest_road(lat, lon):

    query = f"""
    [out:json];
    (
      way["highway"](around:5000,{lat},{lon});
    );
    out center 1;
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
            )
        }

    except Exception as e:

        print("ROAD ERROR:", e)

        return None

def land_intelligence_summary(
    infrastructure,
    road
):

    score = 0

    insights = []

    bus = infrastructure.get("bus_stop")

    if bus and bus["distance_km"] < 5:
        score += 2
        insights.append(
            "Good public transport access"
        )

    school = infrastructure.get("school")

    if school and school["distance_km"] < 10:
        score += 1
        insights.append(
            "Schools nearby"
        )

    hospital = infrastructure.get("hospital")

    if hospital and hospital["distance_km"] < 15:
        score += 1
        insights.append(
            "Healthcare accessible"
        )

    if road and road["distance_km"] < 2:
        score += 2
        insights.append(
            "Strong road accessibility"
        )

    classification = "Rural"

    if score >= 5:
        classification = "High Development Potential"

    elif score >= 3:
        classification = "Peri-Urban"

    return {
        "score": score,
        "classification": classification,
        "insights": insights
    }

@app.post("/upload-coordinates")
async def upload_coordinates(
    file: UploadFile = File(...)
):

    content = await file.read()

    text = content.decode("utf-8")

    coords = parse_coordinate_text(text)

    if len(coords) < 4:

        return {
            "error": "Need at least 4 coordinates"
        }

    if coords[0] != coords[-1]:
        coords.append(coords[0])

    center = calculate_center(coords)

    area = polygon_area(coords)

    print("BEFORE INFRASTRUCTURE")

    infrastructure = infrastructure_intelligence(
        center[0],
        center[1]
    )

    road = nearest_road(
        center[0],
        center[1]
    )

    intelligence = land_intelligence_summary(
        infrastructure,
        road
    )

    print("AFTER INFRASTRUCTURE")

    return {
        "coordinates": coords,
        "center": center,
        "area_estimate": area,
        "infrastructure": infrastructure,
        "road_access": road,
        "intelligence": intelligence
    }
    
@app.post("/manual-parcel")
async def manual_parcel(parcel: ParcelRequest):

    coords = [
        (c.lat, c.lon)
        for c in parcel.coordinates
    ]

    # auto-close polygon
    if coords[0] != coords[-1]:
        coords.append(coords[0])

    if len(coords) < 4:
        return {
            "error": "At least 4 coordinates required"
        }

    center = calculate_center(coords)

    area = polygon_area(coords)

    # -----------------------------------
    # Infrastructure intelligence
    # -----------------------------------

    infrastructure = infrastructure_intelligence(
        center[0],
        center[1]
    )

    road = nearest_road(
        center[0],
        center[1]
    )

    intelligence = land_intelligence_summary(
        infrastructure,
        road
    )

    return {

        "coordinates": coords,

        "center": center,

        "area_estimate": area,

        "infrastructure": infrastructure,

        "road_access": road,

        "intelligence": intelligence
    }

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    image = pdf_first_page_image(content)
    pil_image = Image.fromarray(image)

    text = pytesseract.image_to_string(pil_image)
    polygons = detect_polygons(image)

    lot_labels = extract_lot_labels(text)
    place_names = extract_place_names(text)
    detected_location = None

    for place in place_names:
        geo = geocode_place(place)
        if geo:
            detected_location = geo
            break
    if not detected_location:
        detected_location = {
            "lat": -27.4705,
            "lon": 153.026
        }
    return {
        "lot_labels": lot_labels,
        "place_names": place_names,
        "detected_location": detected_location,
        "polygon_count": len(polygons),
        "polygons": polygons[:10],
        "raw_text": text[:4000]
    }