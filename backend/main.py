from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from routing.router import get_route

from intelligence import (
    generate_land_intelligence
)

app = FastAPI()

# =========================================================
# CORS
# =========================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================================================
# REQUEST MODELS
# =========================================================

class ManualParcelRequest(BaseModel):

    coordinates: list


class RouteRequest(BaseModel):

    start_lat: float
    start_lon: float

    end_lat: float
    end_lon: float

    mode: str = "driving"

# =========================================================
# HEALTH
# =========================================================

@app.get("/")
def root():

    return {
        "status": "FindMyLand backend running"
    }

# =========================================================
# MANUAL PARCEL
# =========================================================

@app.post("/manual-parcel")
def manual_parcel(
    req: ManualParcelRequest
):

    coords = req.coordinates

    center_lat = sum(
        c[0] for c in coords
    ) / len(coords)

    center_lon = sum(
        c[1] for c in coords
    ) / len(coords)

    center = [

        center_lat,

        center_lon
    ]

    infrastructure = (
        generate_land_intelligence(
            center_lat,
            center_lon
        )
    )

    return {

        "coordinates": coords,

        "center": center,

        "detected_location": {

            "lat": center_lat,

            "lon": center_lon
        },

        "infrastructure":
            infrastructure
    }

# =========================================================
# ROUTING
# =========================================================

@app.post("/route")
def route(
    req: RouteRequest
):

    print("\n====================")
    print("BACKEND /route HIT")
    print("====================")
    print("MODE:", req.mode)

    result = get_route(

        req.start_lon,
        req.start_lat,

        req.end_lon,
        req.end_lat,

        req.mode
    )

    if not result:

        return {

            "error":
                "No route found"
        }

    return result