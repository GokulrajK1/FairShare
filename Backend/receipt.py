"""
ReceiptScanning.py
------------------
Scans a receipt image or PDF using the Veryfi OCR API and returns
parsed itemized results as a structured list of dictionaries.

Usage:
    python ReceiptScanning.py path/to/receipt.jpg
"""

import requests
import sys
import json
import os

# =============================
# CONFIGURATION
# =============================
VERYFI_CLIENT_ID = "vrfOnXKi9F4Rvvwn1r5hGGfDNDjzehTbMmA0IZ8"
VERYFI_USERNAME = "adityasv20"
VERYFI_API_KEY = "54d540f3189779901d2fdcf67fc2ee9f"
VERYFI_ENDPOINT = "https://api.veryfi.com/api/v8/partner/documents"

# =============================
# MAIN LOGIC
# =============================

def scan_receipt(filepath: str):
    """
    Uploads the given receipt image/PDF to Veryfi and returns parsed items.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    with open(filepath, "rb") as f:
        files = {"file": (os.path.basename(filepath), f, "application/octet-stream")}
        headers = {
            "Accept": "application/json",
            "CLIENT-ID": VERYFI_CLIENT_ID,
            "AUTHORIZATION": f"apikey {VERYFI_USERNAME}:{VERYFI_API_KEY}",
        }

        print("Uploading to Veryfi API...")
        response = requests.post(VERYFI_ENDPOINT, headers=headers, files=files)

    # 201 = success
    if response.status_code not in (200, 201):
        print(f"Error {response.status_code}: {response.text}")
        return []

    data = response.json()
    items = extract_items(data)
    return items


def extract_items(response_json):
    """
    Extracts itemized line data from the Veryfi JSON response.
    Returns a clean list of dicts: [{"name": "Item", "price": 9.99}, ...]
    """
    items = []
    for line in response_json.get("line_items", []):
        name = line.get("description") or line.get("text") or "Unknown"
        price = line.get("total")
        if price is None:
            continue
        try:
            price = float(price)
        except:
            continue
        items.append({"name": name.strip(), "price": price})
    return items


def main():
    if len(sys.argv) < 2:
        print("Usage: python receipt.py <path_to_receipt>")
        sys.exit(1)

    filepath = sys.argv[1]
    print(f"Scanning receipt: {filepath}\n")
    items = scan_receipt(filepath)

    if not items:
        print("No items extracted.")
    else:
        print("\n✅ Extracted Items:")
        print(json.dumps(items, indent=2))

        # Optional: save to output.json
        with open("output.json", "w") as f:
            json.dump(items, f, indent=2)
        print("\nResults saved to output.json ✅")


if __name__ == "__main__":
    main()