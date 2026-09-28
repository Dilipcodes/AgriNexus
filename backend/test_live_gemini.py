import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

from app.services.disease_service import analyze_crop_disease

async def test_live():
    # Minimal 1x1 green leaf pixel or real small image
    test_leaf_jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    
    print("Testing live Gemini multimodal disease analysis...")
    res = await analyze_crop_disease(test_leaf_jpeg, crop="Rice", mode="REAL")
    print(f"Status: {res.provenance.status}")
    print(f"Source: {res.provenance.source}")
    print(f"Disease: {res.disease_name}")
    print(f"Confidence: {res.confidence_display}")
    print(f"Severity: {res.severity} ({res.severity_color})")
    print(f"Symptoms count: {len(res.symptoms)}")
    print(f"Immediate actions count: {len(res.immediate_actions)}")
    print(f"Advisory: {res.advisory_disclaimer[:60]}...")
    print(f"Is Plant: {res.is_plant}")

if __name__ == "__main__":
    asyncio.run(test_live())
