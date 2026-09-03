# FindMyLand

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)

> Turn a parcel's coordinates into a map of what surrounds it.

FindMyLand is a geospatial **land-intelligence prototype** that takes the boundary coordinates of a land parcel, places that parcel on an interactive map, and enriches it with nearby infrastructure, amenities, and transport information.

A cadastral map answers a very specific question:

> **Where is this parcel?**

FindMyLand aims to expand that question into:

> **What is this parcel's geographic context?**
> **What is nearby? How far away is it? How can I get there?**

A parcel boundary tells you **where the land is**. FindMyLand tries to answer the next questions.

- Where is the parcel located?
- What hospitals, schools, pharmacies, banks, supermarkets and other amenities are nearby?
- How far away are those places?
- Where are nearby transport connections such as bus stops and railway stations?
- How long does it take to reach a selected place?
- Can the route be displayed directly on the map?

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

- Node.js and npm
- Python 3
- A MapTiler API key for the map style used by the frontend
- Internet access for external geographic and routing services

### 1. Clone the repository

```bash
git clone https://github.com/TitusQuinctiusFlamininus/findMyLand.git
cd findMyLand
```

### 2. Start the backend

```bash
cd backend

python -m venv .venv
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


