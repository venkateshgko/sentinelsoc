from fastapi import APIRouter

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    return {
        "total_events": 18243,
        "critical_threats": 7,
        "high_threats": 23,
        "blocked_sources": 31,
        "threat_distribution": {
            "critical": 7,
            "high": 23,
            "medium": 48,
            "low": 76,
        },
        "threat_activity": [
            {"time": "00:00", "threats": 32, "events": 420},
            {"time": "02:00", "threats": 41, "events": 510},
            {"time": "04:00", "threats": 28, "events": 390},
            {"time": "06:00", "threats": 55, "events": 680},
            {"time": "08:00", "threats": 72, "events": 920},
            {"time": "10:00", "threats": 61, "events": 810},
            {"time": "12:00", "threats": 94, "events": 1240},
            {"time": "14:00", "threats": 81, "events": 1080},
            {"time": "16:00", "threats": 112, "events": 1420},
            {"time": "18:00", "threats": 88, "events": 1160},
            {"time": "20:00", "threats": 74, "events": 980},
            {"time": "22:00", "threats": 52, "events": 710},
        ],
    }
