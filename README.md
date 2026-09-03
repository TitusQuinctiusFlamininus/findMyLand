# FindMyLand

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)

> Turn a parcel's coordinates into a map of what surrounds it.

FindMyLand is a geospatial **land-intelligence prototype** that takes the boundary coordinates of a land parcel, places that parcel on an interactive map, and enriches it with nearby infrastructure, amenities, and transport information.

![alt text](https://github.com/TitusQuinctiusFlamininus/findMyLand/blob/main/images/findMyLand1.png "UX")

A cadastral map on its own tries to answer question:

> **What are the dimensions and internal partitions of a parcel.**

But the context of the presentation of that information is quite unknown.  

FindMyLand aims to expand that question into:

- Where is the parcel located?
- What hospitals, schools, pharmacies, banks, supermarkets and other amenities are nearby?
- How far away are those places?
- Where are nearby transport connections such as bus stops and railway stations?
- How long does it take to reach a selected place?
- Can the route be displayed directly on the map?

![alt text](https://github.com/TitusQuinctiusFlamininus/findMyLand/blob/main/images/findMyLand2.png "UX2")

The current application accepts a set of latitude/longitude points describing a parcel, calculates its center, queries nearby geographic features, and presents the results through an interactive map.

The project is therefore best understood as a **parcel-context and accessibility explorer**, rather than a cadastral-management system.

That context can be useful when exploring land for:

- Property research
- Land acquisition
- Development studies
- Site selection
- Accessibility analysis
- Rural and urban planning
- Real-estate due diligence
- Infrastructure discovery

In an advanced practical version of this application, if parcel land-value trends can be mapped relative to the context in which the parcel is presented (its surroundings and rate of growth), one could, for example, find out how fast parcel land value may increase or decrease in the future.

---

## ✨ Key features

### 📍 Parcel visualization

Provide at least four coordinate points and FindMyLand draws them as a polygon on an interactive map.

The application also calculates the parcel's approximate center point and uses it as the reference location for the surrounding analysis.

### 🏥 Infrastructure intelligence

FindMyLand searches a radius of up to **10 km** around the parcel center for nearby mapped features.

Currently supported categories include:

| Category | What FindMyLand looks for |
| --- | --- |
| 🏥 Hospital | Hospitals |
| 🏫 School | Schools |
| 🚌 Bus stop | Bus stops |
| 🚆 Railway | Railway stations |
| 🍽️ Restaurant | Restaurants |
| 💊 Pharmacy | Pharmacies |
| ⛽ Fuel | Fuel stations |
| 🏦 Bank | Banks |
| 🛒 Supermarket | Supermarkets |
| 🌳 Park | Parks |
| 👮 Police | Police stations |
| 🚒 Fire station | Fire stations |
| ✈️ Airport | Aerodromes |
| 🏨 Hotel | Hotels |
| 🎓 University | Universities |

For each category, the application identifies the nearest mapped location and reports its distance from the parcel.

The surrounding-place data is obtained through OpenStreetMap's Overpass API.

### 🧭 Interactive exploration

Selecting a place from the intelligence panel moves the map to that location and displays it in context.

The interface is designed around a simple workflow:

**Parcel → nearby place → route → journey information**

### 🚗🚶🚌🚆 Routing

Choose a travel mode and calculate a route between the parcel and a selected nearby location.

Supported modes in the current interface are:

- Driving
- Walking
- Bus / public transport
- Train / rail

Driving and walking routes use OSRM. Public transport routing is handled through OpenTripPlanner, with a fallback to driving when a transit route cannot be returned.

Route results can include:

- Distance
- Estimated duration
- Routing provider
- Turn-by-turn journey legs
- Route geometry displayed on the map

---

## 🚀 Getting started

FindMyLand currently consists of a Next.js frontend and a Python/FastAPI backend.

### Prerequisites

You will need:
- Maptiler Account for an API KEY (see frontend Map.js to add your key here). PLEASE NOTE DISCLAIMER: This repository assumes you have your OWN key and does not promise anything or assume any costs associated with YOUR personal use of the maptiler API through your key. See: https://docs.maptiler.com/cloud/api/#description/introduction
- Node.js and npm
- Python 3
- Internet access for external geographic and routing services

### 1. Clone the repository

```bash
git clone https://github.com/TitusQuinctiusFlamininus/findMyLand.git
cd findMyLand
```

### 2. Start the backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate
```

On Windows:

```powershell
.venv\Scripts\activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The backend should then be available at:

```text
http://localhost:8000
```

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend is configured to talk to the local backend at:

```text
http://localhost:8000
```

Open the local Next.js URL shown by the development server.

---
## 🚦 Using your own OSRM routing data

FindMyLand can be run with your **own OSRM routing server**, allowing you to keep routing data locally instead of depending on a public OSRM instance.

This is particularly useful when:

* You want routing to work without relying on a third-party routing server.
* You are working with a specific country, region, or city.
* You want predictable routing performance.
* You need to avoid public API rate limits.
* You want to control which OpenStreetMap data version is used.
* You are deploying FindMyLand on your own infrastructure.

OSRM runs on OpenStreetMap road-network data.

### 1. Download OpenStreetMap data

You first need an OpenStreetMap extract in `.osm.pbf` format.

A convenient source is **Geofabrik**, which provides regularly updated extracts for countries and smaller regions around the world.

For example, to download Berlin:

```bash
wget https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf
```

For a larger area, choose the appropriate extract from the Geofabrik download directory.

> **Tip:** Start with the smallest geographic extract that covers the parcels you want to analyze. A country-wide extract can require substantial disk space, RAM, CPU time, and preprocessing time.

The downloaded file should look something like:

```text
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osm.pbf
```

Geofabrik provides OSM extracts specifically for applications such as routing and GIS. The OSRM documentation also uses Geofabrik extracts in its own setup instructions.

### 2. Install/run OSRM with Docker

The easiest way to run OSRM is with the official Docker image.

```bash
docker pull ghcr.io/project-osrm/osrm-backend:latest
```

Create a directory for the routing data and put your `.osm.pbf` file there:

```text
osrm/
└── CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osm.pbf
```

From inside that directory, run:

```bash
docker run -t \
  -v "${PWD}:/data" \
  ghcr.io/project-osrm/osrm-backend \
  osrm-extract \
  -p /opt/car.lua \
  /data/berlin-latest.osm.pbf
```

`osrm-extract` reads the OpenStreetMap PBF file and converts it into an intermediate OSRM graph using a routing profile. The `car.lua` profile tells OSRM how to interpret the road network for automobile routing.

After extraction you will see several files beginning with:

```text
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
```

For example:

```text
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm.datasource_names
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm.ebg_nodes
CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm.edges
...
```

There is an important detail here: **`berlin-latest.osrm` is effectively the base name for a collection of files, not necessarily a single file containing the complete routing database.** OSRM refers to this collection as an `.osrm.*` dataset.

### 3. Prepare the routing graph

For the recommended MLD pipeline, run:

```bash
docker run -t \
  -v "${PWD}:/data" \
  ghcr.io/project-osrm/osrm-backend \
  osrm-partition \
  /data/CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
```

Then:

```bash
docker run -t \
  -v "${PWD}:/data" \
  ghcr.io/project-osrm/osrm-backend \
  osrm-customize \
  /data/CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
```

OSRM's documentation recommends MLD as the default preprocessing method. For applications requiring the alternative Contraction Hierarchies (CH) pipeline, `osrm-partition` and `osrm-customize` are replaced by `osrm-contract`.

### 4. Start the local OSRM server

Once preprocessing has completed, start `osrm-routed`:

```bash
docker run -t \
  -p 5000:5000 \
  -v "${PWD}:/data" \
  ghcr.io/project-osrm/osrm-backend \
  osrm-routed \
  --algorithm mld \
  /data/CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
```

Your local routing server is now available at:

```text
http://localhost:5000
```

OSRM exposes an HTTP API. For example:

```bash
curl "http://localhost:5000/route/v1/driving/13.388860,52.517037;13.385983,52.496891?steps=true"
```

A successful response contains the calculated route as JSON, including distance, duration, and route geometry.

### 5. Connect FindMyLand to your local OSRM server

FindMyLand's routing layer communicates with OSRM through its HTTP API.

Instead of sending routing requests to a public OSRM server, configure the OSRM provider used by FindMyLand to point to your local instance:

```text
http://localhost:5000
```

If FindMyLand is running inside Docker or on another machine, **`localhost` means the machine/container running FindMyLand**, not necessarily the machine running OSRM.

For example, if both applications are running as Docker containers on the same Docker network, use the OSRM container/service name:

```text
http://osrm:5000
```

A typical deployment might therefore look like:

```text
┌─────────────────────────┐
│      FindMyLand         │
│                         │
│  Frontend + FastAPI     │
└────────────┬────────────┘
             │
             │ HTTP
             ▼
┌─────────────────────────┐
│      OSRM Server        │
│                         │
│     port 5000           │
└────────────┬────────────┘
             │
             ▼
       OpenStreetMap
       routing graph
```

### 6. Test OSRM before connecting FindMyLand

Before troubleshooting FindMyLand, verify that your OSRM installation works independently.

Run:

```bash
curl "http://localhost:5000/route/v1/driving/13.388860,52.517037;13.385983,52.496891?steps=true"
```

If OSRM is working, you should receive a JSON response rather than a connection error.

You can also open the endpoint in a browser:

```text
http://localhost:5000
```

If this works, the OSRM server itself is running and the remaining configuration is on the FindMyLand side.

### 🚲🚶 Different routing profiles

The example above uses the automobile profile:

```bash
-p /opt/car.lua
```

OSRM profiles determine how the OSM road network is interpreted for routing. The standard OSRM distribution includes profiles such as `car`, `bicycle`, and `foot`.

For example, a bicycle dataset can be prepared using:

```bash
osrm-extract -p /opt/bicycle.lua CITY_OR_TOWN_OF_YOUR_CHOICE.osm.pbf
```

and a walking dataset using:

```bash
osrm-extract -p /opt/foot.lua CITY_OR_TOWN_OF_YOUR_CHOICE.osm.pbf
```

**Important:** Each profile produces its own routing graph. A graph prepared with `car.lua` should be considered a car-routing dataset. It does not automatically provide bicycle or pedestrian routing.

If you need multiple modes, you can maintain separate OSRM datasets/servers:

```text
OSRM car     → :5000
OSRM bicycle → :5001
OSRM foot    → :5002
```

The OSRM HTTP API identifies the routing profile in the request path, for example:

```text
/route/v1/driving/...
```

The profile used during preprocessing determines the routing behavior.

### 💾 Keeping the OSRM data

Do **not** put large `.osm.pbf` or `.osrm.*` files into the cloned FindMyLand Git repository.

Keep them in a separate data directory:

```text
findMyLand/
├── backend/
├── frontend/
└── ...

routing-data/
├── CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osm.pbf
├── CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm
├── CITY_OR_TOWN_OF_YOUR_CHOICE-latest.osrm.*
└── ...
```

The `.osm.pbf` file is the original OSM extract. The `.osrm.*` files are the processed routing graph generated by OSRM.

For production deployments, mount this directory into the OSRM container rather than rebuilding the graph every time the container starts.

### 🔄 Updating the routing data

OpenStreetMap data changes continuously. Geofabrik publishes updated extracts regularly, so you can periodically download a newer `.osm.pbf` file and rebuild the OSRM graph.

The update process is:

```text
Download new .osm.pbf
        │
        ▼
osrm-extract
        │
        ▼
osrm-partition
        │
        ▼
osrm-customize
        │
        ▼
Restart OSRM
```

This also means that the routing results produced by your installation correspond to the particular OSM extract from which the graph was built.

### ⚠️ Resource requirements

OSRM preprocessing can be considerably more demanding than simply running the finished routing server.

Large geographic extracts may require:

* Significant disk space
* Several GB of RAM or more
* Multiple CPU cores
* Time to complete extraction and graph preparation

The OSRM project notes that preprocessing large extracts can take a substantial amount of time.

For development, **a city or regional extract is strongly recommended** before attempting a complete country or continent.

### 📚 Useful OSRM resources

* [OSRM backend documentation](https://github.com/Project-OSRM/osrm-backend?utm_source=chatgpt.com)
* [OSRM HTTP API documentation](https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md?utm_source=chatgpt.com)
* [Geofabrik OpenStreetMap downloads](https://download.geofabrik.de/?utm_source=chatgpt.com)
* [OSRM Docker images](https://github.com/Project-OSRM/osrm-backend/pkgs/container/osrm-backend?utm_source=chatgpt.com)

> **In summary:** download an `.osm.pbf` extract from Geofabrik, preprocess it with `osrm-extract`, `osrm-partition`, and `osrm-customize`, run `osrm-routed`, and point FindMyLand's OSRM configuration at your local HTTP endpoint.


---
## 📐 Coordinate input format

The current frontend accepts a plain text file containing one latitude/longitude pair per line.

Example:

```text
52.5200,13.4050
52.5205,13.4060
52.5195,13.4065
52.5190,13.4055
```

You can also paste the coordinates directly into the input field.

At least **four valid coordinate lines** are required to create a parcel polygon.

> **Important:** Despite the original project description referring to "cadastral maps", the current frontend implementation accepts `.txt` coordinate files rather than directly uploading and parsing a cadastral PDF/image. The backend dependencies include OCR/PDF and geospatial tooling, suggesting that richer cadastral-document ingestion may be part of the project's direction, but it should not be presented as an implemented feature yet.

---

## 🧪 Project status

FindMyLand is an early-stage prototype.

The current implementation already demonstrates the core concept but actual geospatial data file are not included:

**coordinate-based parcel → geographic context → nearby infrastructure → routing**

There is considerable room to evolve the project into a more complete land-intelligence platform, especially around cadastral document ingestion, richer parcel analytics, and additional geographic datasets.

---

## 🔭 Possible next steps

Some natural directions for the project are:

- Direct PDF/image cadastral-map ingestion
- OCR-assisted extraction of parcel numbers and coordinates
- Automatic georeferencing of scanned cadastral maps
- Parcel area and perimeter calculations
- Land-use and zoning information
- Road-access analysis
- Public transport accessibility scoring
- Flood-risk and terrain analysis
- Utilities and infrastructure proximity
- Population and demographic context
- Agricultural / environmental indicators
- Comparison of multiple parcels
- Exportable land-intelligence reports
- GeoJSON / Shapefile import and export
- Configurable search radius
- Configurable infrastructure categories
- Deployment configuration and environment variables

These are presented as potential directions, not as current features.

---

## 🔐 Data and limitations

FindMyLand should be treated as an **exploration and analysis tool**, not as a legal source of cadastral truth.

Nearby-place results depend on third-party geographic datasets and may be incomplete or outdated.

Distances are calculated from the parcel's calculated center point, not necessarily from the closest point on the parcel boundary.

Routing estimates are provided by external routing services and can vary depending on map data and provider availability.

For legal property boundaries, ownership, zoning, planning permission, or other regulated land matters, authoritative local cadastral and governmental sources should be consulted.

---


